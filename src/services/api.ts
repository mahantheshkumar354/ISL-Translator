import type {
  Prediction,
  TranslationResult,
  HistoryItem,
  SignItem,
  Category,
} from '@/types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// ============================================================
// TYPES
// ============================================================

interface BackendHistoryItem {
  id: number | string;
  mode: string;
  input_text?: string | null;
  output_text?: string | null;
  prediction?: string | null;
  confidence?: number | null;
  created_at: string;
}

// ============================================================
// AUTH HELPERS
// ============================================================

const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};

const requireAuthToken = (): string => {
  const token = getAuthToken();

  if (!token) {
    throw new Error(
      'You must be logged in to use this feature.'
    );
  }

  return token;
};

const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();

  return {
    'Content-Type': 'application/json',

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

// ============================================================
// RESPONSE HANDLER
// ============================================================

const handleResponse = async (
  response: Response
): Promise<Response> => {
  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}`;

    try {
      const errorData: unknown =
        await response.json();

      if (
        typeof errorData === 'object' &&
        errorData !== null &&
        'detail' in errorData
      ) {
        const detail = (
          errorData as {
            detail?: unknown;
          }
        ).detail;

        if (typeof detail === 'string') {
          message = detail;
        }
      }
    } catch {
      // Ignore JSON parsing errors
    }

    throw new Error(message);
  }

  return response;
};

// ============================================================
// SIGN-TO-TEXT PREDICTION
// ============================================================

export const getPrediction = async (
  frameData: string
): Promise<Prediction> => {
  const response = await fetch(
    `${API_BASE_URL}/translation/predict`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        frame: frameData,
      }),
    }
  );

  await handleResponse(response);

  const data: {
    prediction?: string;
    confidence?: number;
    category?: string;
  } = await response.json();

  return {
    id: crypto.randomUUID(),

    sign: data.prediction || '',

    confidence:
      typeof data.confidence === 'number'
        ? data.confidence > 1
          ? data.confidence / 100
          : data.confidence
        : 0,

    timestamp: new Date(),

    category:
      data.category || 'greetings',
  };
};

// ============================================================
// TEXT-TO-SIGN TRANSLATION
// ============================================================

export const translateText = async (
  text: string
): Promise<TranslationResult> => {
  const words = text
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    text,

    wordBreakdown: words.map((word) => ({
      word,
      signAvailable: true,
      confidence: 0.89,
    })),
  };
};

// ============================================================
// BACKEND HISTORY CONVERTER
// ============================================================

const convertBackendHistory = (
  item: BackendHistoryItem
): HistoryItem => {
  let type: HistoryItem['type'];

  if (item.mode === 'sign_to_text') {
    type = 'sign-to-text';
  } else if (item.mode === 'text_to_sign') {
    type = 'text-to-sign';
  } else {
    type = 'speech-to-sign';
  }

  const confidence =
    item.confidence != null
      ? item.confidence > 1
        ? item.confidence / 100
        : item.confidence
      : 0;

  return {
    id: String(item.id),

    type,

    input:
      item.input_text ||
      item.prediction ||
      '',

    output:
      item.output_text ||
      item.prediction ||
      '',

    confidence,

    timestamp: new Date(
      item.created_at
    ),
  };
};

// ============================================================
// FETCH HISTORY
// ============================================================

export const fetchHistory = async (
  limit: number = 50,
  offset: number = 0
): Promise<HistoryItem[]> => {
  const token = requireAuthToken();

  const response = await fetch(
    `${API_BASE_URL}/history?limit=${limit}&offset=${offset}`,
    {
      method: 'GET',

      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  await handleResponse(response);

  const data: unknown =
    await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter(
      (
        item
      ): item is BackendHistoryItem =>
        typeof item === 'object' &&
        item !== null
    )
    .map(convertBackendHistory);
};

// ============================================================
// SAVE HISTORY
// ============================================================

export const saveHistory = async (
  item: Omit<
    HistoryItem,
    'id' | 'timestamp'
  >
): Promise<HistoryItem> => {
  const token = requireAuthToken();

  let mode:
    | 'sign_to_text'
    | 'text_to_sign'
    | 'speech_to_sign';

  if (item.type === 'sign-to-text') {
    mode = 'sign_to_text';
  } else if (
    item.type === 'text-to-sign'
  ) {
    mode = 'text_to_sign';
  } else {
    mode = 'speech_to_sign';
  }

  const response = await fetch(
    `${API_BASE_URL}/history`,
    {
      method: 'POST',

      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        mode,

        input_text: item.input,

        output_text: item.output,

        prediction:
          item.type === 'sign-to-text'
            ? item.output
            : null,

        confidence: item.confidence,
      }),
    }
  );

  await handleResponse(response);

  const data: BackendHistoryItem =
    await response.json();

  return convertBackendHistory(data);
};

// ============================================================
// DASHBOARD STATISTICS
// ============================================================

export const getDashboardStats =
  async (): Promise<{
    totalSigns: number;
    accuracy: number;
    sessionsToday: number;
    avgConfidence: number;

    // REAL TRANSLATION BREAKDOWN
    signToText: number;
    textToSign: number;
    speechToSign: number;
  }> => {
    const token = requireAuthToken();

    const response = await fetch(
      `${API_BASE_URL}/history/dashboard/stats`,
      {
        method: 'GET',

        headers: {
          Authorization:
            `Bearer ${token}`,

          'Content-Type':
            'application/json',
        },
      }
    );

    await handleResponse(response);

    const data: {
      total_translations?: number;
      today_translations?: number;
      average_confidence?: number;

      sign_to_text?: number;
      text_to_sign?: number;
      speech_to_sign?: number;
    } = await response.json();

    return {
      totalSigns:
        Number(
          data.total_translations
        ) || 0,

      accuracy:
        Number(
          data.average_confidence
        ) || 0,

      sessionsToday:
        Number(
          data.today_translations
        ) || 0,

      avgConfidence:
        Number(
          data.average_confidence
        ) || 0,

      // ------------------------------------------
      // REAL BACKEND COUNTS
      // ------------------------------------------

      signToText:
        Number(
          data.sign_to_text
        ) || 0,

      textToSign:
        Number(
          data.text_to_sign
        ) || 0,

      speechToSign:
        Number(
          data.speech_to_sign
        ) || 0,
    };
  };

// ============================================================
// DELETE HISTORY ITEM
// ============================================================

export const deleteHistoryItem =
  async (
    id: string
  ): Promise<void> => {
    const token = requireAuthToken();

    const response = await fetch(
      `${API_BASE_URL}/history/${id}`,
      {
        method: 'DELETE',

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    await handleResponse(response);
  };

// ============================================================
// EXPORT HISTORY
// ============================================================

export const exportHistory =
  async (
    format: 'csv' | 'json' = 'csv'
  ): Promise<Blob> => {
    const token = requireAuthToken();

    const response = await fetch(
      `${API_BASE_URL}/history/export?format=${format}`,
      {
        method: 'GET',

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    await handleResponse(response);

    return response.blob();
  };

// ============================================================
// CATEGORIES
// ============================================================

export const fetchCategories =
  async (): Promise<Category[]> => {
    return [
      {
        id: 'alphabet',
        name: 'Alphabet',
        icon: 'FaFont',
        description:
          'A-Z hand signs',
        signCount: 26,
        color: '#3b82f6',
      },

      {
        id: 'numbers',
        name: 'Numbers',
        icon: 'FaHashtag',
        description:
          '0-9 numeric signs',
        signCount: 10,
        color: '#8b5cf6',
      },

      {
        id: 'greetings',
        name: 'Greetings',
        icon: 'FaHandSparkles',
        description:
          'Common greetings',
        signCount: 15,
        color: '#ec4899',
      },

      {
        id: 'family',
        name: 'Family',
        icon: 'FaUsers',
        description:
          'Family members',
        signCount: 12,
        color: '#f59e0b',
      },

      {
        id: 'food',
        name: 'Food',
        icon: 'FaUtensils',
        description:
          'Food and drinks',
        signCount: 20,
        color: '#10b981',
      },

      {
        id: 'emergency',
        name: 'Emergency',
        icon:
          'FaExclamationTriangle',
        description:
          'Emergency signs',
        signCount: 10,
        color: '#ef4444',
      },

      {
        id: 'daily',
        name: 'Daily Conversation',
        icon: 'FaComments',
        description:
          'Everyday phrases',
        signCount: 30,
        color: '#06b6d4',
      },
    ];
  };

// ============================================================
// SIGNS BY CATEGORY
// ============================================================

export const fetchSignsByCategory =
  async (
    categoryId: string
  ): Promise<SignItem[]> => {
    return Array.from(
      { length: 8 },
      (_, i) => ({
        id: `${categoryId}-${i}`,

        name: `${
          categoryId
            .charAt(0)
            .toUpperCase() +
          categoryId.slice(1)
        } Sign ${i + 1}`,

        category:
          categoryId,

        difficulty: [
          'beginner',
          'intermediate',
          'advanced',
        ][i % 3] as
          | 'beginner'
          | 'intermediate'
          | 'advanced',
      })
    );
  };

// ============================================================
// CAMERA STATUS
// ============================================================

export const getCameraStatus =
  async (): Promise<{
    connected: boolean;
    deviceId: string | null;
  }> => {
    return {
      connected: true,
      deviceId: 'camera',
    };
  };

// ============================================================
// MODEL STATUS
// ============================================================

export const getModelStatus =
  async (): Promise<{
    loaded: boolean;
    model: string;
    version: string;
  }> => {
    return {
      loaded: true,
      model:
        'ISL-Transformer-v2',
      version: '2.1.0',
    };
  };