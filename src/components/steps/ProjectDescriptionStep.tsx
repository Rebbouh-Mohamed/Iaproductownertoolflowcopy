import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useProject, ProjectDescription } from '../ProjectContext';
import { AIButton, AIReformulationService } from '../AIButton';
import { FileText, Save, Wand2, Plus, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { projectService } from '../../services/projectService';
import type { ProjectDescriptionApiResponse, ProjectDescriptionUpdatePayload } from '../../types/project';

const DEFAULT_DESCRIPTION_QUESTIONS = {
  mainFeatures: 'Quelles fonctionnalités principales sont prévues ?',
  users: 'Quels utilisateurs interagiront avec le produit ?',
  keyScenarios: 'Quels scénarios clés ou flux métier ?',
  constraints: 'Contraintes techniques, réglementaires ou business ?',
  criticalPoints: 'Points critiques à surveiller ?'
} as const;

const DEFAULT_DESCRIPTION_QUESTION_SET = new Set(Object.values(DEFAULT_DESCRIPTION_QUESTIONS));

function normalizeQuestionId(question: string) {
  const normalized = question.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `desc-${normalized || `custom-${Date.now()}`}`;
}

function mapDescriptionFromApi(
  apiDescription: ProjectDescriptionApiResponse | null,
  previousCustomQuestions: ProjectDescription['customQuestions']
): ProjectDescription {
  const details = apiDescription?.details ?? {};

  const customQuestions = Object.entries(details)
    .filter(([question]) => !DEFAULT_DESCRIPTION_QUESTION_SET.has(question))
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
    mainFeatures: details[DEFAULT_DESCRIPTION_QUESTIONS.mainFeatures] ?? '',
    users: details[DEFAULT_DESCRIPTION_QUESTIONS.users] ?? '',
    keyScenarios: details[DEFAULT_DESCRIPTION_QUESTIONS.keyScenarios] ?? '',
    constraints: details[DEFAULT_DESCRIPTION_QUESTIONS.constraints] ?? '',
    criticalPoints: details[DEFAULT_DESCRIPTION_QUESTIONS.criticalPoints] ?? '',
    customQuestions
  };
}

function buildDescriptionPayload(description: ProjectDescription): ProjectDescriptionUpdatePayload {
  const details: Record<string, string> = {
    [DEFAULT_DESCRIPTION_QUESTIONS.mainFeatures]: description.mainFeatures ?? '',
    [DEFAULT_DESCRIPTION_QUESTIONS.users]: description.users ?? '',
    [DEFAULT_DESCRIPTION_QUESTIONS.keyScenarios]: description.keyScenarios ?? '',
    [DEFAULT_DESCRIPTION_QUESTIONS.constraints]: description.constraints ?? '',
    [DEFAULT_DESCRIPTION_QUESTIONS.criticalPoints]: description.criticalPoints ?? ''
  };

  description.customQuestions.forEach(question => {
    if (question.question.trim()) {
      details[question.question] = question.answer ?? '';
    }
  });

  return {
    details
  };
}

export function ProjectDescriptionStep() {
  const { state, dispatch } = useProject();
  const { currentProject } = useAuth();
  const [formData, setFormData] = useState<ProjectDescription>(state.projectDescription);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const previousStepRef = useRef(state.currentStep);

  useEffect(() => {
    setFormData(state.projectDescription);
  }, [state.projectDescription]);

  useEffect(() => {
    const previousStep = previousStepRef.current;
    if (previousStep === 2 && state.currentStep !== 2 && hasChanges) {
      void saveDescription();
    }
    previousStepRef.current = state.currentStep;
  }, [state.currentStep]);

  useEffect(() => {
    if (!currentProject) {
      return;
    }

    let isMounted = true;

    const loadDescription = async () => {
      setIsLoading(true);
      setError(null);
      setSaveMessage(null);

      try {
        const response = await projectService.getProjectDescription(currentProject.id);
        if (!isMounted) {
          return;
        }

        const mappedDescription = mapDescriptionFromApi(
          response,
          state.projectDescription.customQuestions
        );
        dispatch({ type: 'SET_PROJECT_DESCRIPTION', payload: mappedDescription });
        setFormData(mappedDescription);
        setHasChanges(false);
      } catch (fetchError) {
        console.error('Erreur lors du chargement de la description projet:', fetchError);
        if (isMounted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Impossible de charger la description du projet.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDescription();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject?.id]);

  const handleChange = (field: keyof ProjectDescription, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaveMessage(null);
  };

  const saveDescription = async () => {
    if (!currentProject || isSaving) {
      return;
    }

    const descriptionToSave: ProjectDescription = {
      ...formData,
      customQuestions: state.projectDescription.customQuestions
    };

    const payload = buildDescriptionPayload(descriptionToSave);

    setIsSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const updated = await projectService.updateProjectDescription(currentProject.id, payload);
      const normalized = mapDescriptionFromApi(updated, descriptionToSave.customQuestions);
      dispatch({ type: 'SET_PROJECT_DESCRIPTION', payload: normalized });
      setFormData(normalized);
      setHasChanges(false);
      setSaveMessage('Description du projet sauvegardée avec succès.');
    } catch (saveError) {
      console.error('Erreur lors de la sauvegarde de la description projet:', saveError);
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
    
    dispatch({ type: 'ADD_PROJECT_DESCRIPTION_CUSTOM_QUESTION', payload: newQuestion });
    setNewQuestionText('');
    setHasChanges(true);
    setSaveMessage(null);
  };

  const updateCustomQuestion = (id: string, field: 'question' | 'answer', value: string) => {
    dispatch({ 
      type: 'UPDATE_PROJECT_DESCRIPTION_CUSTOM_QUESTION', 
      payload: { id, [field]: value } 
    });
    setHasChanges(true);
    setSaveMessage(null);
  };

  const deleteCustomQuestion = (id: string) => {
    dispatch({ type: 'DELETE_PROJECT_DESCRIPTION_CUSTOM_QUESTION', payload: id });
    setHasChanges(true);
    setSaveMessage(null);
  };

  const generateSuggestions = () => {
    // Simulation basée sur la vision produit
    const suggestions: ProjectDescription = {
      mainFeatures: "- Génération automatique de user stories\n- Assistant IA pour Product Vision\n- Export multi-formats (Jira, PDF, Notion)\n- Templates de documentation\n- Validation et suggestions en temps réel",
      users: "- Product Owners : Utilisateurs principaux pour la création\n- Product Managers : Validation et ajustements\n- Équipes Dev : Consultation des stories et critères\n- QA Teams : Accès aux cas de tests générés",
      keyScenarios: "1. Création d'un nouveau produit de A à Z\n2. Amélioration d'un produit existant\n3. Ajout de fonctionnalités à un backlog\n4. Génération de tests pour une release\n5. Export vers les outils de l'équipe",
      constraints: "- Respect RGPD pour les données projet\n- Compatible navigateurs récents\n- Temps de génération < 30 secondes\n- API rate limiting pour éviter spam",
      criticalPoints: "- Qualité des suggestions IA (pertinence)\n- Performance lors de gros projets\n- Fiabilité des exports\n- Sécurité des données projet\n- Facilité d'adoption par les équipes",
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
              Choisissez un projet pour compléter sa description détaillée.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="mb-2">Description détaillée du projet</h1>
        <p className="text-muted-foreground">
          Documentez votre projet pour alimenter la génération de fonctionnalités et stories.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Détails du Projet
          </CardTitle>
          <CardDescription>
            Complétez les informations pour structurer votre projet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement de la description du projet...
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
              <Label htmlFor="mainFeatures">Quelles fonctionnalités principales sont prévues ?</Label>
              <AIButton
                onReformulate={AIReformulationService.reformulateText}
                currentText={formData.mainFeatures}
                onTextUpdate={(text) => handleChange('mainFeatures', text)}
                tooltip="Reformuler les fonctionnalités avec l'IA"
              />
            </div>
            <Textarea
              id="mainFeatures"
              placeholder="Listez les fonctionnalités clés de votre produit..."
              value={formData.mainFeatures}
              onChange={(e) => handleChange('mainFeatures', e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="users">Quels utilisateurs interagiront avec le produit ?</Label>
              <AIButton
                onReformulate={AIReformulationService.reformulateText}
                currentText={formData.users}
                onTextUpdate={(text) => handleChange('users', text)}
                tooltip="Reformuler la description des utilisateurs avec l'IA"
              />
            </div>
            <Textarea
              id="users"
              placeholder="Décrivez les différents types d'utilisateurs et leurs rôles..."
              value={formData.users}
              onChange={(e) => handleChange('users', e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="keyScenarios">Quels scénarios clés ou flux métier ?</Label>
              <AIButton
                onReformulate={AIReformulationService.reformulateText}
                currentText={formData.keyScenarios}
                onTextUpdate={(text) => handleChange('keyScenarios', text)}
                tooltip="Reformuler les scénarios avec l'IA"
              />
            </div>
            <Textarea
              id="keyScenarios"
              placeholder="Décrivez les parcours utilisateurs principaux..."
              value={formData.keyScenarios}
              onChange={(e) => handleChange('keyScenarios', e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="constraints">Contraintes techniques, réglementaires ou business ?</Label>
              <AIButton
                onReformulate={AIReformulationService.reformulateText}
                currentText={formData.constraints}
                onTextUpdate={(text) => handleChange('constraints', text)}
                tooltip="Reformuler les contraintes avec l'IA"
              />
            </div>
            <Textarea
              id="constraints"
              placeholder="Listez toutes les contraintes à prendre en compte..."
              value={formData.constraints}
              onChange={(e) => handleChange('constraints', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="criticalPoints">Points critiques à surveiller ?</Label>
              <AIButton
                onReformulate={AIReformulationService.reformulateText}
                currentText={formData.criticalPoints}
                onTextUpdate={(text) => handleChange('criticalPoints', text)}
                tooltip="Reformuler les points critiques avec l'IA"
              />
            </div>
            <Textarea
              id="criticalPoints"
              placeholder="Identifiez les risques et points d'attention..."
              value={formData.criticalPoints}
              onChange={(e) => handleChange('criticalPoints', e.target.value)}
              rows={3}
            />
          </div>

          {/* Custom Questions */}
          {state.projectDescription.customQuestions.length > 0 && (
            <div className="pt-6 border-t space-y-6">
              <h4 className="flex items-center gap-2">
                Questions personnalisées
              </h4>
              {state.projectDescription.customQuestions.map((customQ) => (
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
                placeholder="Ex: Quelles sont les dépendances techniques ?"
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
              Compléter avec l'IA
            </Button>
            <Button
              onClick={() => void saveDescription()}
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
                  Sauvegarder la description
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

      {state.productVision.problem && (
        <Card>
          <CardHeader>
            <CardTitle>Cohérence avec votre Product Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Vision rappel :</h4>
              <p className="text-sm text-muted-foreground">{state.productVision.problem}</p>
              {formData.mainFeatures && (
                <div className="mt-3">
                  <p className="text-sm">
                    ✅ Vos fonctionnalités semblent alignées avec cette vision.
                  </p>
                </div>
              )}
              {state.projectDescription.customQuestions.filter(q => q.answer).length > 0 && (
                <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium mb-2 text-sm">Réponses personnalisées :</h4>
                  {state.projectDescription.customQuestions.filter(q => q.answer).map(q => (
                    <div key={q.id} className="mt-2">
                      <p className="text-xs font-medium">{q.question}</p>
                      <p className="text-sm text-muted-foreground">{q.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
