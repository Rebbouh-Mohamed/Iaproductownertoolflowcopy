import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { useProject } from '../ProjectContext';
import { Download, FileText, Calendar, TestTube, CheckCircle, FileDown, Eye } from 'lucide-react';

interface ExportOption {
  id: string;
  name: string;
  description: string;
  format: string;
  icon: React.ReactNode;
  selected: boolean;
}

export function ExportStep() {
  const { state } = useProject();
  const [exportOptions, setExportOptions] = useState<ExportOption[]>([
    {
      id: 'product-vision',
      name: 'Product Vision',
      description: 'Document de vision produit complet',
      format: 'PDF',
      icon: <Eye className="w-4 h-4" />,
      selected: true
    },
    {
      id: 'user-stories',
      name: 'Backlog User Stories',
      description: 'Toutes les user stories avec critères d\'acceptation',
      format: 'CSV/JSON',
      icon: <FileText className="w-4 h-4" />,
      selected: true
    },
    {
      id: 'test-cases',
      name: 'Cas de tests QA',
      description: 'Tests fonctionnels, négatifs et de performance',
      format: 'Excel/CSV',
      icon: <TestTube className="w-4 h-4" />,
      selected: true
    },
    {
      id: 'roadmap',
      name: 'Roadmap & Épics',
      description: 'Planning détaillé avec milestones',
      format: 'PDF/Gantt',
      icon: <Calendar className="w-4 h-4" />,
      selected: true
    },
    {
      id: 'project-summary',
      name: 'Résumé Exécutif',
      description: 'Vue d\'ensemble pour les stakeholders',
      format: 'PDF',
      icon: <FileDown className="w-4 h-4" />,
      selected: false
    }
  ]);

  const toggleExportOption = (id: string) => {
    setExportOptions(prev =>
      prev.map(option =>
        option.id === id ? { ...option, selected: !option.selected } : option
      )
    );
  };

  const generatePreview = () => {
    return {
      productVision: state.productVision,
      projectDescription: state.projectDescription,
      selectedFeatures: state.features.filter(f => f.selected),
      userStories: state.userStories,
      testCases: state.testCases,
      epics: state.epics,
      roadmapMilestones: state.roadmapMilestones,
      stats: {
        totalFeatures: state.features.filter(f => f.selected).length,
        totalUserStories: state.userStories.length,
        totalTestCases: state.testCases.length,
        totalEpics: state.epics.length,
        estimatedEffort: state.userStories.reduce((sum, story) => sum + story.estimatedEffort, 0),
        estimatedDuration: Math.ceil(state.userStories.reduce((sum, story) => sum + story.estimatedEffort, 0) / 5)
      }
    };
  };

  const exportData = () => {
    const selectedOptions = exportOptions.filter(option => option.selected);
    const preview = generatePreview();
    
    // Simulation d'export - dans un vrai cas, on générerait les fichiers
    console.log('Export des données:', { selectedOptions, preview });
    
    // Simulation de téléchargement
    selectedOptions.forEach(option => {
      const fileName = `${option.id}-${Date.now()}.${option.format.toLowerCase().split('/')[0]}`;
      console.log(`Téléchargement de ${fileName}`);
    });
  };

  const preview = generatePreview();
  const selectedCount = exportOptions.filter(option => option.selected).length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="mb-2">Revue finale et export</h1>
        <p className="text-muted-foreground">
          Validez l'ensemble de votre projet et générez la documentation finale.
        </p>
      </div>

      {/* Statistiques du projet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Résumé de votre projet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
              <div className="text-2xl font-bold text-blue-600">{preview.stats.totalFeatures}</div>
              <div className="text-sm text-muted-foreground">Fonctionnalités</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="text-2xl font-bold text-green-600">{preview.stats.totalUserStories}</div>
              <div className="text-sm text-muted-foreground">User Stories</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <div className="text-2xl font-bold text-yellow-600">{preview.stats.totalTestCases}</div>
              <div className="text-sm text-muted-foreground">Cas de tests</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
              <div className="text-2xl font-bold text-purple-600">{preview.stats.estimatedDuration}</div>
              <div className="text-sm text-muted-foreground">Semaines estimées</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Options d'export */}
      <Card>
        <CardHeader>
          <CardTitle>Choisissez vos exports</CardTitle>
          <CardDescription>
            Sélectionnez les documents que vous souhaitez générer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exportOptions.map(option => (
              <div key={option.id} className="flex items-center space-x-3 p-3 border rounded hover:bg-muted/50">
                <Checkbox
                  checked={option.selected}
                  onCheckedChange={() => toggleExportOption(option.id)}
                />
                <div className="flex items-center gap-2">
                  {option.icon}
                  <div className="flex-1">
                    <div className="font-medium">{option.name}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                  <Badge variant="outline">{option.format}</Badge>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedCount} documents sélectionnés pour l'export
            </div>
            <Button onClick={exportData} disabled={selectedCount === 0} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exporter ({selectedCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prévisualisation de la Product Vision */}
      {preview.productVision.problem && (
        <Card>
          <CardHeader>
            <CardTitle>Prévisualisation - Product Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-primary">Problème à résoudre</h4>
                  <p className="text-sm">{preview.productVision.problem}</p>
                </div>
                <div>
                  <h4 className="font-medium text-primary">Utilisateur cible</h4>
                  <p className="text-sm">{preview.productVision.persona}</p>
                </div>
                <div>
                  <h4 className="font-medium text-primary">Bénéfice principal</h4>
                  <p className="text-sm">{preview.productVision.benefit}</p>
                </div>
                {preview.productVision.kpis && (
                  <div>
                    <h4 className="font-medium text-primary">KPIs</h4>
                    <pre className="text-sm whitespace-pre-wrap">{preview.productVision.kpis}</pre>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prévisualisation des fonctionnalités */}
      {preview.selectedFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fonctionnalités sélectionnées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {preview.selectedFeatures.map(feature => (
                <div key={feature.id} className="p-3 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{feature.name}</h4>
                    {feature.custom && <Badge variant="outline" className="text-xs">Custom</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prévisualisation de la roadmap */}
      {preview.epics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Épics et Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {preview.epics.sort((a, b) => a.priority - b.priority).map(epic => (
                <div key={epic.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium text-sm">{epic.name}</h4>
                    <p className="text-xs text-muted-foreground">{epic.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{epic.estimatedEffort} pts</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {epic.userStories.length} stories
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contrôles de validation finale */}
      <Card>
        <CardHeader>
          <CardTitle>Validation finale</CardTitle>
          <CardDescription>
            Vérifiez que tous les éléments sont complets avant l'export
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span className="text-sm">Product Vision complète</span>
              {preview.productVision.problem && preview.productVision.persona ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <div className="w-5 h-5 border-2 border-muted rounded-full" />
              )}
            </div>
            
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span className="text-sm">Fonctionnalités sélectionnées</span>
              {preview.selectedFeatures.length > 0 ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <div className="w-5 h-5 border-2 border-muted rounded-full" />
              )}
            </div>
            
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span className="text-sm">User Stories générées</span>
              {preview.userStories.length > 0 ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <div className="w-5 h-5 border-2 border-muted rounded-full" />
              )}
            </div>
            
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span className="text-sm">Cas de tests générés</span>
              {preview.testCases.length > 0 ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <div className="w-5 h-5 border-2 border-muted rounded-full" />
              )}
            </div>
            
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span className="text-sm">Roadmap planifiée</span>
              {preview.epics.length > 0 ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <div className="w-5 h-5 border-2 border-muted rounded-full" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message de félicitations */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <CardContent className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Félicitations !</h3>
          <p className="text-muted-foreground mb-4">
            Votre projet est maintenant complet et prêt à être partagé avec vos équipes.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={exportData} disabled={selectedCount === 0} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Télécharger tout
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              Imprimer la page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}