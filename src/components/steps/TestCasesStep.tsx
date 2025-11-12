import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useProject, TestCase, Bug } from '../ProjectContext';
import { Wand2, TestTube, CheckCircle, XCircle, Zap, Play, AlertTriangle, Bug as BugIcon } from 'lucide-react';
import { AIButton, AIReformulationService } from '../AIButton';

export function TestCasesStep() {
  const { state, dispatch } = useProject();
  const [showBugDialog, setShowBugDialog] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [bugData, setBugData] = useState({
    title: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical'
  });

  const generateTestCases = () => {
    const testCases: TestCase[] = [];

    state.userStories.forEach((story, storyIndex) => {
      // Test fonctionnel principal
      testCases.push({
        id: `test-functional-${story.id}`,
        title: `Test fonctionnel - ${story.title}`,
        type: 'Functional',
        steps: [
          'Naviguer vers la fonctionnalité',
          'Vérifier que l\'interface s\'affiche correctement',
          'Exécuter l\'action principale',
          'Vérifier le résultat attendu',
          'Valider les critères d\'acceptation'
        ],
        expectedResult: story.acceptanceCriteria[0] || 'Le test s\'exécute avec succès',
        userStoryId: story.id,
        status: 'pending'
      });

      // Test négatif
      testCases.push({
        id: `test-negative-${story.id}`,
        title: `Test négatif - ${story.title}`,
        type: 'Negative',
        steps: [
          'Accéder à la fonctionnalité',
          'Saisir des données invalides ou manquantes',
          'Tenter d\'exécuter l\'action',
          'Vérifier la gestion d\'erreur',
          'Valider les messages d\'erreur'
        ],
        expectedResult: 'Les erreurs sont correctement gérées et affichées à l\'utilisateur',
        userStoryId: story.id,
        status: 'pending'
      });

      // Test de performance (pour les stories importantes)
      if (story.priority === 'High') {
        testCases.push({
          id: `test-performance-${story.id}`,
          title: `Test de performance - ${story.title}`,
          type: 'Performance',
          steps: [
            'Mesurer le temps de chargement initial',
            'Exécuter l\'action 10 fois consécutives',
            'Mesurer le temps de réponse moyen',
            'Vérifier l\'usage mémoire',
            'Tester avec une charge simulée'
          ],
          expectedResult: 'Temps de réponse < 2 secondes, pas de fuite mémoire détectée',
          userStoryId: story.id,
          status: 'pending'
        });
      }
    });

    dispatch({ type: 'SET_TEST_CASES', payload: testCases });
  };

  const updateTestStatus = (testId: string, status: TestCase['status'], failureReason?: string) => {
    dispatch({
      type: 'UPDATE_TEST_CASE',
      payload: { 
        id: testId, 
        testCase: { status, failureReason }
      }
    });

    // Si le test échoue, préparer la création du bug
    if (status === 'failed') {
      const testCase = state.testCases.find(t => t.id === testId);
      if (testCase) {
        setSelectedTestCase(testCase);
        setBugData({
          title: `Bug - ${testCase.title}`,
          description: failureReason || 'Test échoué sans raison spécifiée',
          severity: testCase.type === 'Performance' ? 'high' : 'medium'
        });
        setShowBugDialog(true);
      }
    }
  };

  const createBug = () => {
    if (selectedTestCase && bugData.title.trim()) {
      const newBug: Bug = {
        id: `bug-${Date.now()}`,
        title: bugData.title,
        description: bugData.description,
        severity: bugData.severity,
        status: 'open',
        testCaseId: selectedTestCase.id,
        createdDate: new Date().toISOString().split('T')[0]
      };

      dispatch({ type: 'ADD_BUG', payload: newBug });
      setShowBugDialog(false);
      setBugData({ title: '', description: '', severity: 'medium' });
      setSelectedTestCase(null);
    }
  };

  const getTypeIcon = (type: TestCase['type']) => {
    switch (type) {
      case 'Functional':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Negative':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'Performance':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      default:
        return <TestTube className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: TestCase['type']) => {
    switch (type) {
      case 'Functional':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Performance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: TestCase['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: TestCase['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Play className="w-4 h-4 text-gray-600" />;
      default:
        return <Play className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: Bug['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const testsByType = state.testCases.reduce((acc, test) => {
    if (!acc[test.type]) acc[test.type] = [];
    acc[test.type].push(test);
    return acc;
  }, {} as Record<string, TestCase[]>);

  const passedTests = state.testCases.filter(t => t.status === 'passed').length;
  const failedTests = state.testCases.filter(t => t.status === 'failed').length;
  const pendingTests = state.testCases.filter(t => t.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Tests QA et gestion des bugs
        </h1>
        <p className="text-muted-foreground">
          Créez des cas de tests complets, exécutez-les et gérez automatiquement les bugs découverts
        </p>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="secondary">
            {state.testCases.length} cas de tests générés
          </Badge>
          <div className="flex gap-2">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {testsByType.Functional?.length || 0} Fonctionnels
            </Badge>
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              {testsByType.Negative?.length || 0} Négatifs
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              {testsByType.Performance?.length || 0} Performance
            </Badge>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-green-600">
              {passedTests} réussis
            </Badge>
            <Badge variant="outline" className="text-red-600">
              {failedTests} échoués
            </Badge>
            <Badge variant="outline" className="text-gray-600">
              {pendingTests} en attente
            </Badge>
          </div>
        </div>
        <Button onClick={generateTestCases} className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
          <Wand2 className="w-4 h-4" />
          Générer tous les tests
        </Button>
      </div>

      {/* Statistiques des bugs */}
      {state.bugs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BugIcon className="w-5 h-5 text-red-600" />
              Bugs détectés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(['critical', 'high', 'medium', 'low'] as const).map(severity => {
                const bugsCount = state.bugs.filter(b => b.severity === severity).length;
                return (
                  <div key={severity} className="text-center p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-gray-900">{bugsCount}</div>
                    <Badge className={getSeverityColor(severity)}>
                      {severity}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {state.testCases.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <TestTube className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Aucun cas de test généré pour le moment.</p>
              <p className="text-sm">
                Générés automatiquement à partir de vos {state.userStories.length} user stories.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(testsByType).map(([type, tests]) => (
            <div key={type}>
              <div className="flex items-center gap-2 mb-4">
                {getTypeIcon(type as TestCase['type'])}
                <h2 className="text-xl font-semibold">Tests {type}</h2>
                <Badge variant="outline">{tests.length}</Badge>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {tests.map((testCase) => {
                  const relatedStory = state.userStories.find(s => s.id === testCase.userStoryId);
                  
                  return (
                    <Card key={testCase.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base leading-tight">
                              {testCase.title}
                            </CardTitle>
                            <CardDescription className="mt-2">
                              Lié à: {relatedStory?.title.substring(0, 60)}...
                            </CardDescription>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge className={getTypeColor(testCase.type)}>
                              {testCase.type}
                            </Badge>
                            <Badge className={getStatusColor(testCase.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(testCase.status)}
                                {testCase.status}
                              </div>
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2">Étapes du test :</h4>
                            <ol className="space-y-1">
                              {testCase.steps.map((step, index) => (
                                <li key={index} className="text-sm flex gap-2">
                                  <span className="text-muted-foreground min-w-[20px]">
                                    {index + 1}.
                                  </span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Résultat attendu :</h4>
                            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                              {testCase.expectedResult}
                            </p>
                          </div>

                          {testCase.status === 'failed' && testCase.failureReason && (
                            <div>
                              <h4 className="font-medium text-sm mb-2 text-red-600">Raison de l'échec :</h4>
                              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                {testCase.failureReason}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTestStatus(testCase.id, 'passed')}
                              className="flex items-center gap-1 text-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Réussi
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center gap-1 text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Échoué
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Marquer le test comme échoué</DialogTitle>
                                  <DialogDescription>
                                    Expliquez pourquoi ce test a échoué. Un bug sera automatiquement créé.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Raison de l'échec</Label>
                                    <Textarea
                                      placeholder="Décrivez pourquoi ce test a échoué..."
                                      onChange={(e) => {
                                        const reason = e.target.value;
                                        updateTestStatus(testCase.id, 'failed', reason);
                                      }}
                                    />
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog pour créer un bug */}
      <Dialog open={showBugDialog} onOpenChange={setShowBugDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un bug</DialogTitle>
            <DialogDescription>
              Un test a échoué. Créez automatiquement un bug dans le backlog.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <Label>Titre du bug</Label>
                <AIButton
                  onReformulate={AIReformulationService.reformulateText}
                  currentText={bugData.title}
                  onTextUpdate={(text) => setBugData({ ...bugData, title: text })}
                  tooltip="Reformuler le titre du bug avec l'IA"
                />
              </div>
              <Textarea
                value={bugData.title}
                onChange={(e) => setBugData({ ...bugData, title: e.target.value })}
                placeholder="Titre du bug..."
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label>Description détaillée</Label>
                <AIButton
                  onReformulate={AIReformulationService.reformulateText}
                  currentText={bugData.description}
                  onTextUpdate={(text) => setBugData({ ...bugData, description: text })}
                  tooltip="Reformuler la description du bug avec l'IA"
                />
              </div>
              <Textarea
                value={bugData.description}
                onChange={(e) => setBugData({ ...bugData, description: e.target.value })}
                placeholder="Décrivez le problème en détail..."
                rows={4}
              />
            </div>
            <div>
              <Label>Sévérité</Label>
              <Select value={bugData.severity} onValueChange={(value: any) => setBugData({ ...bugData, severity: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={createBug} className="flex-1">
                Créer le bug
              </Button>
              <Button variant="outline" onClick={() => setShowBugDialog(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Résumé des bugs créés */}
      {state.bugs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Backlog des bugs</CardTitle>
            <CardDescription>
              Bugs créés automatiquement à partir des échecs de tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.bugs.map(bug => (
                <div key={bug.id} className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <BugIcon className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-sm">{bug.title}</span>
                      <Badge className={getSeverityColor(bug.severity)}>
                        {bug.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{bug.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {bug.createdDate}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {state.testCases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Couverture de tests</CardTitle>
            <CardDescription>
              Répartition des tests par user story
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.userStories.map(story => {
                const storyTests = state.testCases.filter(t => t.userStoryId === story.id);
                const storyPassed = storyTests.filter(t => t.status === 'passed').length;
                const storyFailed = storyTests.filter(t => t.status === 'failed').length;
                
                return (
                  <div key={story.id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{story.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Priorité: {story.priority}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge variant="outline" className="text-xs">
                        {storyTests.length} tests
                      </Badge>
                      {storyPassed > 0 && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {storyPassed} réussis
                        </Badge>
                      )}
                      {storyFailed > 0 && (
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          {storyFailed} échoués
                        </Badge>
                      )}
                      <div className="flex gap-1">
                        {storyTests.filter(t => t.type === 'Functional').length > 0 && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" title="Tests fonctionnels" />
                        )}
                        {storyTests.filter(t => t.type === 'Negative').length > 0 && (
                          <div className="w-2 h-2 bg-red-500 rounded-full" title="Tests négatifs" />
                        )}
                        {storyTests.filter(t => t.type === 'Performance').length > 0 && (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Tests performance" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}