import React, { useState, useEffect } from 'react';
import { useProject } from '../ProjectContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Progress } from '../ui/progress';
import { AIButton } from '../AIButton';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowRight,
  Clock,
  Target,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Layers,
  Sparkles
} from 'lucide-react';

interface Epic {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'not-started' | 'in-progress' | 'completed';
  userStories: string[];
  estimatedEffort: number;
  businessValue: number;
  quarter: string;
}

interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  priority: 'high' | 'medium' | 'low';
  storyPoints: number;
  epicId: string;
  status: 'backlog' | 'in-progress' | 'done';
}

interface RoadmapItem {
  id: string;
  epicId: string;
  quarter: string;
  status: 'planned' | 'in-progress' | 'completed' | 'at-risk';
  dependencies: string[];
}

const priorityColors = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-orange-100 text-orange-800 border-orange-200',
  low: 'bg-green-100 text-green-800 border-green-200'
};

const statusColors = {
  'not-started': 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'backlog': 'bg-gray-100 text-gray-800',
  'done': 'bg-green-100 text-green-800',
  'planned': 'bg-purple-100 text-purple-800',
  'at-risk': 'bg-red-100 text-red-800'
};

export function PlanningStep() {
  const { state, dispatch } = useProject();
  const [activeTab, setActiveTab] = useState('roadmap');
  const [isGenerating, setIsGenerating] = useState(false);
  const [epics, setEpics] = useState<Epic[]>(state.epics || []);
  const [userStories, setUserStories] = useState<UserStory[]>(state.userStories || []);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>(state.roadmapItems || []);
  const [isEditingEpic, setIsEditingEpic] = useState<Epic | null>(null);
  const [isEditingStory, setIsEditingStory] = useState<UserStory | null>(null);

  // Génération automatique au chargement si les données sont vides
  useEffect(() => {
    if (epics.length === 0 && userStories.length === 0 && roadmapItems.length === 0) {
      generatePlanningData();
    }
  }, []);

  // Synchronisation automatique : User Stories → Epics → Roadmap
  useEffect(() => {
    if (userStories.length > 0) {
      syncEpicsWithUserStories();
    }
  }, [userStories]);

  useEffect(() => {
    if (epics.length > 0) {
      syncRoadmapWithEpics();
    }
  }, [epics]);

  const generatePlanningData = async () => {
    setIsGenerating(true);
    
    // Simulation de génération IA basée sur les données existantes
    const { productVision, projectDescription, features } = state;
    
    try {
      // Génération des User Stories basée sur les fonctionnalités
      const generatedStories: UserStory[] = features.map((feature, index) => ({
        id: `story-${index + 1}`,
        title: `En tant qu'utilisateur, je veux ${feature.name.toLowerCase()}`,
        description: feature.description,
        acceptanceCriteria: [
          'La fonctionnalité est accessible depuis l\'interface principale',
          'L\'utilisateur peut utiliser la fonctionnalité sans erreur',
          'Les données sont sauvegardées correctement'
        ],
        priority: feature.priority as 'high' | 'medium' | 'low',
        storyPoints: Math.ceil(Math.random() * 8) + 1,
        epicId: '',
        status: 'backlog'
      }));

      // Génération des Epics basée sur les groupes de fonctionnalités
      const featureGroups = features.reduce((groups, feature) => {
        const category = feature.category || 'Core';
        if (!groups[category]) groups[category] = [];
        groups[category].push(feature);
        return groups;
      }, {} as Record<string, any[]>);

      const generatedEpics: Epic[] = Object.entries(featureGroups).map(([category, categoryFeatures], index) => ({
        id: `epic-${index + 1}`,
        title: `Epic ${category}`,
        description: `Développement complet des fonctionnalités ${category.toLowerCase()}`,
        priority: categoryFeatures.some(f => f.priority === 'high') ? 'high' : 'medium',
        status: 'not-started',
        userStories: [],
        estimatedEffort: categoryFeatures.length * 2,
        businessValue: Math.ceil(Math.random() * 10) + 1,
        quarter: index === 0 ? 'Q1 2024' : index === 1 ? 'Q2 2024' : 'Q3 2024'
      }));

      // Assignation des User Stories aux Epics
      const updatedStories = generatedStories.map((story, index) => ({
        ...story,
        epicId: generatedEpics[index % generatedEpics.length]?.id || generatedEpics[0]?.id
      }));

      // Génération de la Roadmap
      const generatedRoadmap: RoadmapItem[] = generatedEpics.map(epic => ({
        id: `roadmap-${epic.id}`,
        epicId: epic.id,
        quarter: epic.quarter,
        status: 'planned',
        dependencies: []
      }));

      setUserStories(updatedStories);
      setEpics(generatedEpics);
      setRoadmapItems(generatedRoadmap);

      // Sauvegarde dans le contexte
      dispatch({ type: 'UPDATE_USER_STORIES', payload: updatedStories });
      dispatch({ type: 'UPDATE_EPICS', payload: generatedEpics });
      dispatch({ type: 'UPDATE_ROADMAP', payload: generatedRoadmap });

    } catch (error) {
      console.error('Erreur lors de la génération:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const syncEpicsWithUserStories = () => {
    const updatedEpics = epics.map(epic => ({
      ...epic,
      userStories: userStories.filter(story => story.epicId === epic.id).map(story => story.id),
      estimatedEffort: userStories.filter(story => story.epicId === epic.id).reduce((sum, story) => sum + story.storyPoints, 0)
    }));
    setEpics(updatedEpics);
  };

  const syncRoadmapWithEpics = () => {
    const updatedRoadmap = epics.map(epic => {
      const existing = roadmapItems.find(item => item.epicId === epic.id);
      return existing || {
        id: `roadmap-${epic.id}`,
        epicId: epic.id,
        quarter: epic.quarter,
        status: 'planned' as const,
        dependencies: []
      };
    });
    setRoadmapItems(updatedRoadmap);
  };

  const addEpic = () => {
    const newEpic: Epic = {
      id: `epic-${Date.now()}`,
      title: 'Nouvel Epic',
      description: 'Description de l\'epic',
      priority: 'medium',
      status: 'not-started',
      userStories: [],
      estimatedEffort: 0,
      businessValue: 5,
      quarter: 'Q1 2024'
    };
    setEpics([...epics, newEpic]);
    setIsEditingEpic(newEpic);
  };

  const updateEpic = (updatedEpic: Epic) => {
    const updatedEpics = epics.map(epic => epic.id === updatedEpic.id ? updatedEpic : epic);
    setEpics(updatedEpics);
    dispatch({ type: 'UPDATE_EPICS', payload: updatedEpics });
  };

  const deleteEpic = (epicId: string) => {
    const filteredEpics = epics.filter(epic => epic.id !== epicId);
    setEpics(filteredEpics);
    
    // Supprimer les user stories associées
    const filteredStories = userStories.filter(story => story.epicId !== epicId);
    setUserStories(filteredStories);
    
    dispatch({ type: 'UPDATE_EPICS', payload: filteredEpics });
    dispatch({ type: 'UPDATE_USER_STORIES', payload: filteredStories });
  };

  const addUserStory = (epicId: string) => {
    const newStory: UserStory = {
      id: `story-${Date.now()}`,
      title: 'Nouvelle User Story',
      description: 'En tant qu\'utilisateur, je veux...',
      acceptanceCriteria: ['Critère d\'acceptation'],
      priority: 'medium',
      storyPoints: 3,
      epicId,
      status: 'backlog'
    };
    setUserStories([...userStories, newStory]);
    setIsEditingStory(newStory);
  };

  const updateUserStory = (updatedStory: UserStory) => {
    const updatedStories = userStories.map(story => story.id === updatedStory.id ? updatedStory : story);
    setUserStories(updatedStories);
    dispatch({ type: 'UPDATE_USER_STORIES', payload: updatedStories });
  };

  const deleteUserStory = (storyId: string) => {
    const filteredStories = userStories.filter(story => story.id !== storyId);
    setUserStories(filteredStories);
    dispatch({ type: 'UPDATE_USER_STORIES', payload: filteredStories });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Layers className="w-8 h-8 text-prodigy-primary" />
            Planification Produit
          </h1>
          <p className="text-gray-600 mt-2">
            Roadmap, Epics et User Stories générés automatiquement et synchronisés
          </p>
        </div>
        <Button 
          onClick={generatePlanningData} 
          disabled={isGenerating}
          className="bg-prodigy-primary hover:bg-prodigy-primary-hover"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Génération...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Régénérer avec IA
            </>
          )}
        </Button>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roadmap" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Roadmap
          </TabsTrigger>
          <TabsTrigger value="epics" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Epics
          </TabsTrigger>
          <TabsTrigger value="stories" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            User Stories
          </TabsTrigger>
        </TabsList>

        {/* Roadmap Tab */}
        <TabsContent value="roadmap" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'].map(quarter => (
              <Card key={quarter}>
                <CardHeader>
                  <CardTitle className="text-lg">{quarter}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {roadmapItems
                    .filter(item => epics.find(epic => epic.id === item.epicId)?.quarter === quarter)
                    .map(item => {
                      const epic = epics.find(e => e.id === item.epicId);
                      if (!epic) return null;
                      
                      return (
                        <div key={item.id} className="p-3 border rounded-lg bg-white">
                          <h4 className="font-medium text-sm">{epic.title}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={statusColors[item.status]}>
                              {item.status}
                            </Badge>
                            <Badge className={priorityColors[epic.priority]}>
                              {epic.priority}
                            </Badge>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            {epic.estimatedEffort} SP • Valeur: {epic.businessValue}/10
                          </div>
                        </div>
                      );
                    })}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Epics Tab */}
        <TabsContent value="epics" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Epics ({epics.length})</h2>
            <Button onClick={addEpic} className="bg-prodigy-primary hover:bg-prodigy-primary-hover">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter Epic
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {epics.map(epic => (
              <Card key={epic.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{epic.title}</CardTitle>
                      <CardDescription className="mt-2">{epic.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setIsEditingEpic(epic)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteEpic(epic.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Badge className={priorityColors[epic.priority]}>
                      {epic.priority}
                    </Badge>
                    <Badge className={statusColors[epic.status]}>
                      {epic.status}
                    </Badge>
                    <Badge variant="outline">
                      {epic.quarter}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Effort estimé:</span>
                        <div className="font-medium">{epic.estimatedEffort} Story Points</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Valeur business:</span>
                        <div className="font-medium">{epic.businessValue}/10</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">User Stories</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => addUserStory(epic.id)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-sm">
                        {userStories.filter(story => story.epicId === epic.id).length} stories
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* User Stories Tab */}
        <TabsContent value="stories" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">User Stories ({userStories.length})</h2>
          </div>

          <div className="space-y-4">
            {epics.map(epic => {
              const epicStories = userStories.filter(story => story.epicId === epic.id);
              if (epicStories.length === 0) return null;

              return (
                <Card key={epic.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-prodigy-primary" />
                      {epic.title}
                      <Badge className={priorityColors[epic.priority]}>
                        {epic.priority}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {epicStories.map(story => (
                        <div key={story.id} className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{story.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{story.description}</p>
                              <div className="flex gap-2 mt-3">
                                <Badge className={priorityColors[story.priority]}>
                                  {story.priority}
                                </Badge>
                                <Badge className={statusColors[story.status]}>
                                  {story.status}
                                </Badge>
                                <Badge variant="outline">
                                  {story.storyPoints} SP
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setIsEditingStory(story)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => deleteUserStory(story.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        onClick={() => addUserStory(epic.id)}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter une User Story
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Epic Edit Dialog */}
      {isEditingEpic && (
        <Dialog open={!!isEditingEpic} onOpenChange={() => setIsEditingEpic(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier l'Epic</DialogTitle>
              <DialogDescription>
                Modifiez les détails de l'epic. Les changements se répercuteront automatiquement sur la roadmap.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="epic-title">Titre</Label>
                <Input
                  id="epic-title"
                  value={isEditingEpic.title}
                  onChange={(e) => setIsEditingEpic({...isEditingEpic, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="epic-description">Description</Label>
                <Textarea
                  id="epic-description"
                  value={isEditingEpic.description}
                  onChange={(e) => setIsEditingEpic({...isEditingEpic, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="epic-priority">Priorité</Label>
                  <Select value={isEditingEpic.priority} onValueChange={(value: any) => setIsEditingEpic({...isEditingEpic, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="low">Basse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="epic-status">Statut</Label>
                  <Select value={isEditingEpic.status} onValueChange={(value: any) => setIsEditingEpic({...isEditingEpic, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-started">Non commencé</SelectItem>
                      <SelectItem value="in-progress">En cours</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="epic-quarter">Trimestre</Label>
                  <Select value={isEditingEpic.quarter} onValueChange={(value) => setIsEditingEpic({...isEditingEpic, quarter: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                      <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                      <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                      <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditingEpic(null)}>
                  Annuler
                </Button>
                <Button onClick={() => {
                  updateEpic(isEditingEpic);
                  setIsEditingEpic(null);
                }}>
                  Sauvegarder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* User Story Edit Dialog */}
      {isEditingStory && (
        <Dialog open={!!isEditingStory} onOpenChange={() => setIsEditingStory(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier la User Story</DialogTitle>
              <DialogDescription>
                Modifiez les détails de la user story. Les changements se répercuteront automatiquement sur l'epic.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="story-title">Titre</Label>
                <div className="flex gap-2">
                  <Input
                    id="story-title"
                    value={isEditingStory.title}
                    onChange={(e) => setIsEditingStory({...isEditingStory, title: e.target.value})}
                    className="flex-1"
                  />
                  <AIButton
                    onImprove={(improved) => setIsEditingStory({...isEditingStory, title: improved})}
                    currentValue={isEditingStory.title}
                    placeholder="Améliorer le titre de la user story"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="story-description">Description</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="story-description"
                    value={isEditingStory.description}
                    onChange={(e) => setIsEditingStory({...isEditingStory, description: e.target.value})}
                    className="flex-1"
                  />
                  <AIButton
                    onImprove={(improved) => setIsEditingStory({...isEditingStory, description: improved})}
                    currentValue={isEditingStory.description}
                    placeholder="Améliorer la description"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="story-priority">Priorité</Label>
                  <Select value={isEditingStory.priority} onValueChange={(value: any) => setIsEditingStory({...isEditingStory, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="low">Basse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="story-status">Statut</Label>
                  <Select value={isEditingStory.status} onValueChange={(value: any) => setIsEditingStory({...isEditingStory, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backlog">Backlog</SelectItem>
                      <SelectItem value="in-progress">En cours</SelectItem>
                      <SelectItem value="done">Terminé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="story-points">Story Points</Label>
                  <Input
                    id="story-points"
                    type="number"
                    min="1"
                    max="13"
                    value={isEditingStory.storyPoints}
                    onChange={(e) => setIsEditingStory({...isEditingStory, storyPoints: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditingStory(null)}>
                  Annuler
                </Button>
                <Button onClick={() => {
                  updateUserStory(isEditingStory);
                  setIsEditingStory(null);
                }}>
                  Sauvegarder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}