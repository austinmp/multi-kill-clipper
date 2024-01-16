import * as React from 'react';

export interface FormData {
  summonerName: string;
  tagline: string;
  selectedKillTypes: string[];
}

// Define the shape of the errors object
export interface FormErrors {
  summonerName: boolean;
  tagline: boolean;
  selectedKillTypes: boolean;
}

export type HandleFormSubmitType = (
  event: React.FormEvent<HTMLFormElement>,
) => Promise<void>;


export type LoadingStatusType = {
  isLoading: boolean;
  message: string | null;
};
