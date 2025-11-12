import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { useProject, Feature } from '../ProjectContext';
import { AIButton, AIReformulationService } from '../AIButton';
import { Plus, Lightbulb, Wand2, Check } from 'lucide-react';

const suggestedFeatures: Omit<Feature, 'selected'>[] = [
  {
    id: 'auth',
    name: 'Authentification et autorisation',
    description: 'Système complet de connexion sécurisé avec gestion des rôles utilisateurs (admin, manager, user) et authentification multi-facteur',
    custom: false
  },
  {
    id: 'dashboard',
    name: 'Tableau de bord interactif',
    description: 'Interface de pilotage avec widgets personnalisables, métriques en temps réel et visualisations graphiques des KPIs',
    custom: false
  },
  {
    id: 'user-management',
    name: 'Gestion avancée des utilisateurs',
    description: 'Module complet de création, modification, suppression d\'utilisateurs avec attribution de permissions granulaires',
    custom: false
  },
  {
    id: 'notifications',
    name: 'Centre de notifications intelligent',
    description: 'Système de notifications push, email et SMS avec paramétrage fin des alertes et historique des messages',
    custom: false
  },
  {
    id: 'search',
    name: 'Moteur de recherche avancé',
    description: 'Recherche full-text avec filtres multiples, tri intelligent et sauvegarde des recherches fréquentes',
    custom: false
  },
  {
    id: 'export',
    name: 'Export et import de données',
    description: 'Fonctionnalités d\'export en multiple formats (CSV, PDF, Excel, JSON) avec templates personnalisables',
    custom: false
  },
  {
    id: 'api',
    name: 'API REST et webhooks',
    description: 'Interface API complète avec documentation Swagger, authentification par tokens et webhooks pour intégrations',
    custom: false
  },
  {
    id: 'analytics',
    name: 'Module d\'analytiques business',
    description: 'Suivi comportemental des utilisateurs, rapports automatisés et insights business avec machine learning',
    custom: false
  },
  {
    id: 'mobile',
    name: 'Application mobile native',
    description: 'App mobile responsive ou native (iOS/Android) avec synchronisation offline et notifications push',
    custom: false
  },
  {
    id: 'collaboration',
    name: 'Outils de collaboration',
    description: 'Espace de travail collaboratif avec commentaires, partage de documents, chat intégré et workflow d\'approbation',
    custom: false
  },
  {
    id: 'workflow',
    name: 'Moteur de workflow',
    description: 'Création de processus métier automatisés avec règles conditionnelles et approbations en cascade',
    custom: false
  },
  {
    id: 'reporting',
    name: 'Module de reporting avancé',
    description: 'Générateur de rapports avec builder drag & drop, planification automatique et distribution par email',
    custom: false
  },
  {
    id: 'backup',
    name: 'Sauvegarde et récupération',
    description: 'Système de backup automatique avec versioning et restauration rapide en cas de panne',
    custom: false
  },
  {
    id: 'integration',
    name: 'Hub d\'intégrations',
    description: 'Connecteurs pré-configurés avec outils populaires (Slack, Teams, Salesforce, etc.) et marketplace d\'apps',
    custom: false
  },
  {
    id: 'security',
    name: 'Module de sécurité avancé',
    description: 'Chiffrement bout-en-bout, audit trail complet, conformité RGPD et outils de détection d\'intrusion',
    custom: false
  }
];

export function FeaturesStep() {
  const { state, dispatch } = useProject();
  const [customFeature, setCustomFeature] = useState({ name: '', description: '' });

  useEffect(() => {
    // Initialiser avec les features suggérées si pas encore fait
    if (state.features.length === 0) {
      const featuresWithSelection = suggestedFeatures.map(f => ({ ...f, selected: false }));
      dispatch({ type: 'SET_FEATURES', payload: featuresWithSelection });
    }
  }, [state.features.length, dispatch]);

  const toggleFeature = (featureId: string) => {
    dispatch({ type: 'TOGGLE_FEATURE', payload: featureId });
  };

  const addCustomFeature = () => {
    if (customFeature.name.trim()) {
      const newFeature: Feature = {
        id: `custom-${Date.now()}`,
        name: customFeature.name,
        description: customFeature.description,
        selected: true,
        custom: true
      };
      dispatch({ type: 'ADD_FEATURE', payload: newFeature });
      setCustomFeature({ name: '', description: '' });
    }
  };

  const generateAIFeatures = () => {
    // Simulation de génération basée sur la description du projet
    const aiFeatures: Feature[] = [
      {
        id: 'ai-assistant',
        name: 'Assistant IA intégré',
        description: 'Suggestions intelligentes basées sur le contexte',
        selected: false,
        custom: true
      },
      {
        id: 'auto-documentation',
        name: 'Documentation automatique',
        description: 'Génération auto de docs techniques',
        selected: false,
        custom: true
      },
      {
        id: 'smart-validation',
        name: 'Validation intelligente',
        description: 'Contrôles qualité automatisés',
        selected: false,
        custom: true
      }
    ];

    const updatedFeatures = [...state.features, ...aiFeatures];
    dispatch({ type: 'SET_FEATURES', payload: updatedFeatures });
  };

  const selectedCount = state.features.filter(f => f.selected).length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="mb-2">Suggestion de fonctionnalités</h1>
        <p className="text-muted-foreground">
          Sélectionnez les fonctionnalités pertinentes pour votre produit et ajoutez-en de personnalisées.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Badge variant="secondary">{selectedCount} fonctionnalités sélectionnées</Badge>
          <Button onClick={generateAIFeatures} variant="outline" size="sm" className="flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Suggérer avec l'IA
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.features.map((feature) => (
          <Card key={feature.id} className={`cursor-pointer transition-all ${
            feature.selected ? 'ring-2 ring-primary bg-primary/5' : ''
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={feature.selected}
                  onCheckedChange={() => toggleFeature(feature.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm leading-tight">{feature.name}</h4>
                    {feature.custom && (
                      <Badge variant="outline" className="text-xs">Custom</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  {feature.selected && (
                    <div className="flex items-center gap-1 mt-2 text-primary">
                      <Check className="w-3 h-3" />
                      <span className="text-xs font-medium">Sélectionnée</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Ajouter une fonctionnalité personnalisée
          </CardTitle>
          <CardDescription>
            Décrivez une fonctionnalité spécifique à votre projet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feature-name">Nom de la fonctionnalité</Label>
            <Input
              id="feature-name"
              placeholder="Ex: Générateur de rapports automatique"
              value={customFeature.name}
              onChange={(e) => setCustomFeature(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="feature-description">Description</Label>
              <AIButton
                onReformulate={AIReformulationService.reformulateText}
                currentText={customFeature.description}
                onTextUpdate={(text) => setCustomFeature(prev => ({ ...prev, description: text }))}
                tooltip="Reformuler la description de la fonctionnalité avec l'IA"
              />
            </div>
            <Textarea
              id="feature-description"
              placeholder="Décrivez cette fonctionnalité en détail..."
              value={customFeature.description}
              onChange={(e) => setCustomFeature(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          <Button 
            onClick={addCustomFeature} 
            disabled={!customFeature.name.trim()}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter cette fonctionnalité
          </Button>
        </CardContent>
      </Card>

      {selectedCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Récapitulatif de votre sélection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {state.features.filter(f => f.selected).map(feature => (
                <div key={feature.id} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="font-medium">{feature.name}</span>
                  {feature.custom && <Badge variant="outline" className="text-xs">Custom</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}