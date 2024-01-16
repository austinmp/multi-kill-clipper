import MultiKillClipper from './MultiKillClipper';
import { DialogProvider } from './dialogue/MessageDialogContext';

export default function MultiKillClipperWrapper() {
  return (
    <DialogProvider>
      <MultiKillClipper />
    </DialogProvider>
  );
}
