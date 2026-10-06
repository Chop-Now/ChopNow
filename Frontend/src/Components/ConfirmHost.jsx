import React, { useCallback, useEffect, useState } from 'react';
import ConfirmationModal from '../admin/components/ConfirmationModal';
import { registerConfirmHandler } from '../utils/confirm';

/** Mounted once near the top of the app; renders whatever confirmAction() asks for. */
const ConfirmHost = () => {
  const [request, setRequest] = useState(null);

  useEffect(
    () =>
      registerConfirmHandler(
        (opts) =>
          new Promise((resolve) => {
            setRequest({ opts, resolve });
          })
      ),
    []
  );

  const settle = useCallback(
    (answer) => {
      request?.resolve(answer);
      setRequest(null);
    },
    [request]
  );

  useEffect(() => {
    if (!request) return undefined;
    const onKey = (e) => e.key === 'Escape' && settle(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [request, settle]);

  if (!request) return null;
  const { opts } = request;
  return (
    <ConfirmationModal
      isOpen
      type={opts.danger === false ? 'logout' : 'delete'}
      title={opts.title}
      message={opts.message}
      confirmLabel={opts.confirmLabel}
      cancelLabel={opts.cancelLabel}
      onClose={() => settle(false)}
      onConfirm={() => settle(true)}
    />
  );
};

export default ConfirmHost;
