import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { useProject } from '../ProjectContext';
import { AIButton, AIReformulationService } from '../AIButton';
import { Plus, Lightbulb, Wand2, Check, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { projectService } from '../../services/projectService';
import type { ProjectFeature } from '../../types/project';

const suggestedFeatures: Array<Omit<ProjectFeature, 'selected'>> = [
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
  const { currentProject } = useAuth();
  const [customFeature, setCustomFeature] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingFeatureId, setPendingFeatureId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentProject) {
      dispatch({ type: 'SET_FEATURES', payload: [] });
      return;
    }

    let isMounted = true;
    const loadFeatures = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const features = await projectService.listFeatures(currentProject.id);
        if (!isMounted) return;
        dispatch({ type: 'SET_FEATURES', payload: features });
      } catch (fetchError) {
        console.error('Erreur lors du chargement des fonctionnalités:', fetchError);
        if (isMounted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Impossible de charger les fonctionnalités pour ce projet.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadFeatures();

    return () => {
      isMounted = false;
    };
  }, [currentProject?.id, dispatch]);

  const toggleFeature = async (feature: ProjectFeature) => {
    if (!currentProject) {
      return;
    }
    setPendingFeatureId(feature.id);
    setError(null);
    try {
      const updated = await projectService.updateFeature(currentProject.id, feature.id, {
        selected: !feature.selected
      });
      dispatch({ type: 'UPDATE_FEATURE', payload: { id: updated.id, feature: updated } });
    } catch (updateError) {
      console.error('Erreur lors de la mise à jour de la fonctionnalité:', updateError);
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Impossible de mettre à jour cette fonctionnalité.'
      );
    } finally {
      setPendingFeatureId(null);
    }
  };

  const addCustomFeature = async () => {
    if (!currentProject || !customFeature.name.trim()) {
      return;
    }
    setIsCreatingCustom(true);
    setError(null);
    try {
      const created = await projectService.createFeature(currentProject.id, {
        title: customFeature.name.trim(),
        description: customFeature.description.trim(),
        source: 'user',
        selected: true
      });
      dispatch({ type: 'ADD_FEATURE', payload: created });
      setCustomFeature({ name: '', description: '' });
    } catch (createError) {
      console.error('Erreur lors de l’ajout de la fonctionnalité:', createError);
      setError(
        createError instanceof Error
          ? createError.message
          : 'Impossible d’ajouter cette fonctionnalité.'
      );
    } finally {
      setIsCreatingCustom(false);
    }
  };

  const generateAIFeatures = async () => {
    if (!currentProject) {
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const existingNames = new Set(
        state.features.map(feature => feature.name.toLowerCase())
      );
      const candidates = suggestedFeatures
        .filter(feature => !existingNames.has(feature.name.toLowerCase()))
        .slice(0, 3);

      await Promise.all(
        candidates.map(feature =>
          projectService.createFeature(currentProject.id, {
            title: feature.name,
            description: feature.description,
            category: feature.category,
            source: 'ai',
            selected: false
          })
        )
      );

      const refreshed = await projectService.listFeatures(currentProject.id);
      dispatch({ type: 'SET_FEATURES', payload: refreshed });
    } catch (aiError) {
      console.error('Erreur lors de la génération de fonctionnalités IA:', aiError);
      setError(
        aiError instanceof Error
          ? aiError.message
          : 'Impossible de générer des fonctionnalités automatiquement.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedCount = useMemo(
    () => state.features.filter(feature => feature.selected).length,
    [state.features]
  );

  if (!currentProject) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Sélectionnez un projet</CardTitle>
            <CardDescription>
              Choisissez un projet pour gérer ses fonctionnalités.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="mb-2">Suggestion de fonctionnalités</h1>
        <p className="text-muted-foreground">
          Sélectionnez les fonctionnalités pertinentes pour votre produit et ajoutez-en de personnalisées.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="secondary">{selectedCount} fonctionnalités sélectionnées</Badge>
          <Button
            onClick={generateAIFeatures}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={isGenerating || isLoading}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Suggérer avec l'IA
              </>
            )}
          </Button>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement des fonctionnalités...
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : state.features.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucune fonctionnalité pour le moment</CardTitle>
            <CardDescription>
              Ajoutez votre première fonctionnalité personnalisée ou laissez l'IA vous suggérer des idées.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.features.map((feature) => (
            <Card
              key={feature.id}
              className={`cursor-pointer transition-all ${
                feature.selected ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={feature.selected}
                    onCheckedChange={() => toggleFeature(feature)}
                    className="mt-1"
                    disabled={
                      pendingFeatureId === feature.id ||
                      isLoading ||
                      isGenerating ||
                      isCreatingCustom
                    }
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
                    {feature.category && (
                      <p className="text-[11px] text-muted-foreground mt-2">
                        Catégorie : <span className="font-medium">{feature.category}</span>
                      </p>
                    )}
                    {feature.selected && (
                      <div className="flex items-center gap-1 mt-2 text-primary">
                        {pendingFeatureId === feature.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        <span className="text-xs font-medium">Sélectionnée</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
            disabled={!customFeature.name.trim() || isCreatingCustom || isLoading}
            className="flex items-center gap-2"
          >
            {isCreatingCustom ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Ajout en cours...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Ajouter cette fonctionnalité
              </>
            )}
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