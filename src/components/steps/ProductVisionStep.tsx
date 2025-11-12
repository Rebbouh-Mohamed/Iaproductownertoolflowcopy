import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useProject, ProductVision } from '../ProjectContext';
import { AIButton, AIReformulationService } from '../AIButton';
import { Lightbulb, Save, Wand2, Plus, X } from 'lucide-react';

export function ProductVisionStep() {
  const { state, dispatch } = useProject();
  const [formData, setFormData] = useState<ProductVision>(state.productVision);
  const [newQuestionText, setNewQuestionText] = useState('');

  useEffect(() => {
    setFormData(state.productVision);
  }, [state.productVision]);

  const handleChange = (field: keyof ProductVision, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveVision = () => {
    dispatch({ type: 'SET_PRODUCT_VISION', payload: formData });
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
  };

  const updateCustomQuestion = (id: string, field: 'question' | 'answer', value: string) => {
    dispatch({ 
      type: 'UPDATE_PRODUCT_VISION_CUSTOM_QUESTION', 
      payload: { id, [field]: value } 
    });
  };

  const deleteCustomQuestion = (id: string) => {
    dispatch({ type: 'DELETE_PRODUCT_VISION_CUSTOM_QUESTION', payload: id });
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
  };

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
            <Button onClick={saveVision} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Sauvegarder la vision
            </Button>
          </div>
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
