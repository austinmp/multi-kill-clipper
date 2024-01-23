import { DialogProvider } from './dialogue/MessageDialogContext';
import MultiKillClipper from './MultiKillClipper';

export default function MultiKillClipperWrapper() {
  return (
    <DialogProvider>
      <MultiKillClipper />
    </DialogProvider>
  );
}
