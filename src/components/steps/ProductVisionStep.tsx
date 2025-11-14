import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useProject, ProductVision } from '../ProjectContext';
import { AIButton, AIReformulationService } from '../AIButton';
import { Lightbulb, Save, Wand2, Plus, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { projectService } from '../../services/projectService';
import type { ProductVisionApiResponse, ProductVisionUpdatePayload } from '../../types/project';

const DEFAULT_VISION_QUESTIONS = {
  problem: 'Quel problème ce produit résout-il ?',
  persona: 'Pour quel utilisateur / persona ?',
  benefit: 'Quel bénéfice principal ?',
  kpis: 'Quels KPIs ou critères de succès ?',
  constraints: 'Quelles contraintes / limites à respecter ?'
} as const;

const DEFAULT_VISION_QUESTIONS_SET = new Set(Object.values(DEFAULT_VISION_QUESTIONS));

function normalizeQuestionId(question: string) {
  const normalized = question.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `api-${normalized || `custom-${Date.now()}`}`;
}

function mapVisionFromApi(
  apiVision: ProductVisionApiResponse | null,
  previousCustomQuestions: ProductVision['customQuestions']
): ProductVision {
  const questionsAnswers = apiVision?.questions_answers ?? {};

  const customQuestions = Object.entries(questionsAnswers)
    .filter(([question]) => !DEFAULT_VISION_QUESTIONS_SET.has(question))
    .map(([question, answer]) => {
      const existing = previousCustomQuestions.find(
        q => q.question.trim().toLowerCase() === question.trim().toLowerCase()
      );
      return {
        id: existing?.id ?? normalizeQuestionId(question),
        question,
        answer: answer ?? ''
      };
    });

  return {
    problem: questionsAnswers[DEFAULT_VISION_QUESTIONS.problem] ?? '',
    persona: questionsAnswers[DEFAULT_VISION_QUESTIONS.persona] ?? '',
    benefit: questionsAnswers[DEFAULT_VISION_QUESTIONS.benefit] ?? '',
    kpis: questionsAnswers[DEFAULT_VISION_QUESTIONS.kpis] ?? '',
    constraints: questionsAnswers[DEFAULT_VISION_QUESTIONS.constraints] ?? '',
    customQuestions
  };
}

function buildVisionPayload(vision: ProductVision): ProductVisionUpdatePayload {
  const questions: Record<string, string> = {
    [DEFAULT_VISION_QUESTIONS.problem]: vision.problem ?? '',
    [DEFAULT_VISION_QUESTIONS.persona]: vision.persona ?? '',
    [DEFAULT_VISION_QUESTIONS.benefit]: vision.benefit ?? '',
    [DEFAULT_VISION_QUESTIONS.kpis]: vision.kpis ?? '',
    [DEFAULT_VISION_QUESTIONS.constraints]: vision.constraints ?? ''
  };

  vision.customQuestions.forEach(question => {
    if (question.question.trim()) {
      questions[question.question] = question.answer ?? '';
    }
  });

  return {
    questions_answers: questions
  };
}

export function ProductVisionStep() {
  const { state, dispatch } = useProject();
  const { currentProject } = useAuth();
  const [formData, setFormData] = useState<ProductVision>(state.productVision);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const previousStepRef = useRef(state.currentStep);

  useEffect(() => {
    setFormData(state.productVision);
  }, [state.productVision]);

  useEffect(() => {
    const prevStep = previousStepRef.current;
    if (prevStep === 1 && state.currentStep !== 1 && hasChanges) {
      void saveVision();
    }
    previousStepRef.current = state.currentStep;
  }, [state.currentStep]);

  useEffect(() => {
    if (!currentProject) {
      return;
    }

    let isMounted = true;
    const loadVision = async () => {
      setIsLoading(true);
      setError(null);
      setSaveMessage(null);

      try {
        const response = await projectService.getProductVision(currentProject.id);
        if (!isMounted) {
          return;
        }

        const mappedVision = mapVisionFromApi(response, state.productVision.customQuestions);
        dispatch({ type: 'SET_PRODUCT_VISION', payload: mappedVision });
        setFormData(mappedVision);
        setHasChanges(false);
      } catch (fetchError) {
        console.error('Erreur lors du chargement de la product vision:', fetchError);
        if (isMounted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Impossible de charger la product vision pour ce projet.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadVision();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject?.id]);

  const handleChange = (field: keyof ProductVision, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaveMessage(null);
  };

  const saveVision = async () => {
    if (!currentProject || isSaving) {
      return;
    }

    const visionToSave: ProductVision = {
      ...formData,
      customQuestions: state.productVision.customQuestions
    };

    const payload = buildVisionPayload(visionToSave);

    setIsSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const updated = await projectService.updateProductVision(currentProject.id, payload);
      const normalized = mapVisionFromApi(updated, visionToSave.customQuestions);
      dispatch({ type: 'SET_PRODUCT_VISION', payload: normalized });
      setFormData(normalized);
      setHasChanges(false);
      setSaveMessage('Product vision sauvegardée avec succès.');
    } catch (saveError) {
      console.error('Erreur lors de la sauvegarde de la product vision:', saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const addCustomQuestion = () => {
    if (!newQuestionText.trim()) return;
    
    const newQuestion = {
      id: `custom-${Date.now()}`,
      question: newQuestionText,
      answer: ''
    };
    
    dispatch({ type: 'ADD_PRODUCT_VISION_CUSTOM_QUESTION', payload: newQuestion });
    setNewQuestionText('');
    setHasChanges(true);
    setSaveMessage(null);
  };

  const updateCustomQuestion = (id: string, field: 'question' | 'answer', value: string) => {
    dispatch({ 
      type: 'UPDATE_PRODUCT_VISION_CUSTOM_QUESTION', 
      payload: { id, [field]: value } 
    });
    setHasChanges(true);
    setSaveMessage(null);
  };

  const deleteCustomQuestion = (id: string) => {
    dispatch({ type: 'DELETE_PRODUCT_VISION_CUSTOM_QUESTION', payload: id });
    setHasChanges(true);
    setSaveMessage(null);
  };

  const generateSuggestions = () => {
    // Simulation de génération par IA
    const suggestions: ProductVision = {
      problem: "Les équipes produit perdent du temps à créer manuellement la documentation projet et manquent de structure dans leur processus de définition produit.",
      persona: "Product Owners et Product Managers travaillant dans des équipes agiles, ayant besoin d'outils pour structurer leur réflexion produit.",
      benefit: "Réduction de 70% du temps de création de documentation produit et amélioration de la cohérence des livrables.",
      kpis: "- Temps de création d'un backlog divisé par 3\n- Taux d'adoption de l'outil > 80%\n- Satisfaction utilisateur > 4.5/5",
      constraints: "- Intégration avec les outils existants (Jira, Notion)\n- Interface intuitive pour utilisateurs non-techniques\n- Export dans formats standards",
      customQuestions: formData.customQuestions
    };
    
    setFormData(suggestions);
    setHasChanges(true);
    setSaveMessage(null);
  };

  const isSaveDisabled = useMemo(
    () => !currentProject || isSaving || isLoading || !hasChanges,
    [currentProject, isSaving, isLoading, hasChanges]
  );

  if (!currentProject) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Sélectionnez un projet</CardTitle>
            <CardDescription>
              Choisissez un projet dans la liste pour commencer à définir sa product vision.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="mb-2">Génération de la Product Vision</h1>
        <p className="text-muted-foreground">
          Définissez une vision claire et structurée de votre produit en répondant aux questions ci-dessous.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Questions Stratégiques
          </CardTitle>
          <CardDescription>
            Remplissez les champs ci-dessous pour structurer votre vision produit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement de la product vision...
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="problem">Quel problème ce produit résout-il ?</Label>
              <AIButton
                onReformulate={AIReformulationService.reformulateText}
                currentText={formData.problem}
                onTextUpdate={(text) => handleChange('problem', text)}
                tooltip="Reformuler la description du problème avec l'IA"
              />
            </div>
            <Textarea
              id="problem"
              placeholder="Décrivez le problème principal que votre produit adresse..."
              value={formData.problem}
              onChange={(e) => handleChange('problem', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="persona">Pour quel utilisateur / persona ?</Label>
              <AIButton
                onReformulate={AIReformulationService.reformulateText}
                currentText={formData.persona}
                onTextUpdate={(text) => handleChange('persona', text)}
                tooltip="Reformuler la description du persona avec l'IA"
              />
            </div>
            <Textarea
              id="persona"
              placeholder="Définissez votre utilisateur cible principal..."
              value={formData.persona}
              onChange={(e) => handleChange('persona', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="benefit">Quel bénéfice principal ?</Label>
              <AIButton
                onReformulate={AIReformulationService.reformulateText}
                currentText={formData.benefit}
                onTextUpdate={(text) => handleChange('benefit', text)}
                tooltip="Reformuler la description du bénéfice avec l'IA"
              />
            </div>
            <Textarea
              id="benefit"
              placeholder="Décrivez la valeur ajoutée principale pour l'utilisateur..."
              value={formData.benefit}
              onChange={(e) => handleChange('benefit', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="kpis">Quels KPIs ou critères de succès ?</Label>
              <AIButton
                onReformulate={AIReformulationService.reformulateText}
                currentText={formData.kpis}
                onTextUpdate={(text) => handleChange('kpis', text)}
                tooltip="Reformuler les KPIs avec l'IA"
              />
            </div>
            <Textarea
              id="kpis"
              placeholder="Listez les indicateurs de performance et critères de réussite..."
              value={formData.kpis}
              onChange={(e) => handleChange('kpis', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="constraints">Quelles contraintes / limites à respecter ?</Label>
              <AIButton
                onReformulate={AIReformulationService.reformulateText}
                currentText={formData.constraints}
                onTextUpdate={(text) => handleChange('constraints', text)}
                tooltip="Reformuler les contraintes avec l'IA"
              />
            </div>
            <Textarea
              id="constraints"
              placeholder="Décrivez les contraintes techniques, budget, délais, réglementaires..."
              value={formData.constraints}
              onChange={(e) => handleChange('constraints', e.target.value)}
              rows={3}
            />
          </div>

          {/* Custom Questions */}
          {state.productVision.customQuestions.length > 0 && (
            <div className="pt-6 border-t space-y-6">
              <h4 className="flex items-center gap-2">
                Questions personnalisées
              </h4>
              {state.productVision.customQuestions.map((customQ) => (
                <div key={customQ.id} className="space-y-2 p-4 bg-muted/30 rounded-lg relative">
                  <Button
                    onClick={() => deleteCustomQuestion(customQ.id)}
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="space-y-2">
                    <Label htmlFor={`custom-q-${customQ.id}`}>Question</Label>
                    <Input
                      id={`custom-q-${customQ.id}`}
                      value={customQ.question}
                      onChange={(e) => updateCustomQuestion(customQ.id, 'question', e.target.value)}
                      placeholder="Votre question personnalisée..."
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`custom-a-${customQ.id}`}>Réponse</Label>
                      <AIButton
                        onReformulate={AIReformulationService.reformulateText}
                        currentText={customQ.answer}
                        onTextUpdate={(text) => updateCustomQuestion(customQ.id, 'answer', text)}
                        tooltip="Reformuler la réponse avec l'IA"
                      />
                    </div>
                    <Textarea
                      id={`custom-a-${customQ.id}`}
                      value={customQ.answer}
                      onChange={(e) => updateCustomQuestion(customQ.id, 'answer', e.target.value)}
                      placeholder="Votre réponse..."
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Custom Question */}
          <div className="pt-6 border-t space-y-3">
            <Label htmlFor="new-question">Ajouter une question personnalisée</Label>
            <div className="flex gap-2">
              <Input
                id="new-question"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Ex: Quels sont les risques potentiels ?"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomQuestion();
                  }
                }}
              />
              <Button onClick={addCustomQuestion} variant="outline" className="flex items-center gap-2 flex-shrink-0">
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={generateSuggestions} variant="outline" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Générer des suggestions IA
            </Button>
            <Button
              onClick={() => void saveVision()}
              className="flex items-center gap-2"
              disabled={isSaveDisabled}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Sauvegarder la vision
                </>
              )}
            </Button>
          </div>

          {saveMessage && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              {saveMessage}
            </div>
          )}
        </CardContent>
      </Card>

      {(formData.problem || formData.persona) && (
        <Card>
          <CardHeader>
            <CardTitle>Prévisualisation de votre Product Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                {formData.problem && (
                  <div>
                    <h4 className="font-medium text-primary">Problème à résoudre :</h4>
                    <p className="text-sm">{formData.problem}</p>
                  </div>
                )}
                {formData.persona && (
                  <div>
                    <h4 className="font-medium text-primary">Utilisateur cible :</h4>
                    <p className="text-sm">{formData.persona}</p>
                  </div>
                )}
                {formData.benefit && (
                  <div>
                    <h4 className="font-medium text-primary">Bénéfice principal :</h4>
                    <p className="text-sm">{formData.benefit}</p>
                  </div>
                )}
                {state.productVision.customQuestions.filter(q => q.answer).length > 0 && (
                  <div>
                    <h4 className="font-medium text-primary">Questions personnalisées :</h4>
                    {state.productVision.customQuestions.filter(q => q.answer).map(q => (
                      <div key={q.id} className="mt-2">
                        <p className="text-xs font-medium">{q.question}</p>
                        <p className="text-sm">{q.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
