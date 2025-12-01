import { apiClient } from './apiClient';
import { getAuthHeaders } from './sessionService';

const IA_BASE_PATH = '/api/ia/';

interface SuggestionResponse {
    suggestion: string;
}

interface SuggestionPayload {
    project_id: number;
    question: string;
    mode?: 'general' | 'detailed' | 'init_funcs' | 'suggest_funcs';
    style?: string;
}

function getAuthConfig() {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error('Jeton d’authentification manquant. Veuillez vous reconnecter.');
    }
    return { headers };
}

export const iaService = {
    async suggest(
        projectId: number | string,
        question: string,
        mode: 'general' | 'detailed' | 'init_funcs' | 'suggest_funcs' = 'general',
        style: string = 'concise'
    ): Promise<string> {
        const payload: SuggestionPayload = {
            project_id: Number(projectId),
            question,
            mode,
            style
        };

        try {
            const response = await apiClient.post<SuggestionResponse, SuggestionPayload>(
                `${IA_BASE_PATH}suggest/`,
                payload,
                getAuthConfig()
            );
            return response.suggestion;
        } catch (error) {
            console.error('IA Suggestion Error:', error);
            throw error;
        }
    }
};
