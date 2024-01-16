import React, { createContext, useContext, useState } from 'react';
import MessageDialog from './MessageDialog';

const DialogContext = createContext();

export const useDialog = () => useContext(DialogContext);

export function DialogProvider({ children }) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [filePath, setFilePath] = useState<string>('');

  const showDialog = (
    newTitle: string,
    newMessage: string,
    newFilePath?: string,
  ) => {
    setTitle(newTitle);
    setMessage(newMessage);
    setDialogOpen(true);
    setFilePath(newFilePath);
  };

  const hideDialog = () => {
    setDialogOpen(false);
  };

  return (
    <DialogContext.Provider value={{ showDialog, hideDialog }}>
      {children}
      <MessageDialog
        open={dialogOpen}
        handleClose={hideDialog}
        title={title}
        message={message}
        filePath={filePath}
      />
    </DialogContext.Provider>
  );
}
