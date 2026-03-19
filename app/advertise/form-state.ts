export interface AdvertiserFormState {
  status: 'idle' | 'success' | 'error';
  message: string;
}

export const advertiserInitialState: AdvertiserFormState = {
  status: 'idle',
  message: ''
};
