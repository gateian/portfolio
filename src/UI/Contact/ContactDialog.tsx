import { useCallback, useState } from 'react';
import EmailModal from '../Modal/Modal';
import ToastNotification from '../Toast/ToastNotifcation';
import { CONTACT_EMAIL } from '../../data/site';
import { copyToClipboard } from '../../utils/clipboard';

/**
 * The footer's Contact modal (email + copy button + toast), usable anywhere.
 * The footer is hidden on full pages, so the menu and About page bring their
 * own copy of the same dialog.
 */
export function useContactDialog() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const hideToast = useCallback(() => setToast(false), []);

  const handleCopy = async () => {
    const success = await copyToClipboard(CONTACT_EMAIL);
    if (success) {
      setToast(true);
    } else {
      alert(`Could not copy email. Please copy it manually: ${CONTACT_EMAIL}`);
    }
  };

  const element = (
    <>
      {open && (
        <EmailModal
          email={CONTACT_EMAIL}
          onClose={() => setOpen(false)}
          onCopy={handleCopy}
        />
      )}
      <ToastNotification
        message="Email copied to clipboard!"
        visible={toast}
        onHide={hideToast}
      />
    </>
  );

  return { openContact: () => setOpen(true), contactDialog: element };
}
