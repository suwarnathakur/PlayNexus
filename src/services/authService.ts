// Mock futuristic authentication service
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  telemetryLog?: string[];
}

export const authService = {
  authenticate: async (playerIdOrEmail: string, accessCode: string): Promise<AuthResponse> => {
    // Artificial combat network sync delay
    await new Promise(resolve => setTimeout(resolve, 1400));

    // Simple validation rule: access code must be at least 4 characters
    if (!playerIdOrEmail || !accessCode || accessCode.length < 4) {
      return {
        success: false,
        message: 'INVALID ACCESS CODE OR PLAYER IDENTIFIER',
      };
    }

    return {
      success: true,
      message: 'AUTHENTICATION_SUCCESSFUL',
      token: `NEXUS-TOKEN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      telemetryLog: [
        'PLAYER ID ........ VERIFIED',
        'NEURAL LINK ....... STABLE',
        'COMBAT PROFILE .... FOUND',
        'NEXUS ACCESS ...... GRANTED',
      ],
    };
  },

  register: async (playerId: string, email: string, accessCode: string): Promise<AuthResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    if (!playerId || !email || !accessCode) {
      return {
        success: false,
        message: 'ALL REGISTRATION PARAMETERS REQUIRED',
      };
    }

    return {
      success: true,
      message: 'PLAYER PROFILE INITIALIZED IN NEXUS REGISTRY',
      token: `NEXUS-TOKEN-${Date.now()}`,
    };
  }
};
