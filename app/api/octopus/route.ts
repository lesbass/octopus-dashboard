import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const octopusConfig = {
  serverUrl: process.env.OCTOPUS_SERVER_URL || '',
  apiKey: process.env.OCTOPUS_API_KEY || '',
  spaceId: process.env.OCTOPUS_SPACE_ID || '',
  envOrder: process.env.ENV_ORDER || '',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint parameter is required' },
        { status: 400 }
      );
    }

    if (!octopusConfig.serverUrl || !octopusConfig.apiKey || !octopusConfig.spaceId) {
      return NextResponse.json(
        { error: 'Octopus Deploy configuration is missing' },
        { status: 500 }
      );
    }

    // Sostituisce il placeholder {spaceId} con il valore reale
    endpoint = endpoint.replace('{spaceId}', octopusConfig.spaceId);

    const url = `${octopusConfig.serverUrl}${endpoint}`;
    
    // Rimuove 'endpoint' dai parametri prima di inoltrarli
    const params = Object.fromEntries(searchParams.entries());
    delete params.endpoint;

    const response = await axios.get(url, {
      headers: {
        'X-Octopus-ApiKey': octopusConfig.apiKey,
        'Content-Type': 'application/json',
      },
      params,
    });

    return NextResponse.json({
      ...response.data,
      envOrder: octopusConfig.envOrder,
    });
  } catch (error: any) {
    console.error('Octopus API Error:', error.message);
    return NextResponse.json(
      { 
        error: 'Failed to fetch from Octopus Deploy',
        details: error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}
