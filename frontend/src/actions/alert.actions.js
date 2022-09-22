import { useSetRecoilState, useResetRecoilState } from 'recoil';

import { alertAtom } from 'state';

export { useAlertActions };

function useAlertActions () {
  const setAlert = useSetRecoilState(alertAtom);
  const resetAlert = useResetRecoilState(alertAtom);

  const AlertTypes = {
    Success: 'alert-success',
    Info: 'alert-info',
    Warning: 'alert-warning',
    Error: 'alert-error',
    Basic: 'alert-basic',
  }

  return {
    AlertTypes,
    success: message => setAlert({ message, type: AlertTypes.Success }),
    info: message => setAlert({ message, type: AlertTypes.Info }),
    warning: message => setAlert({ message, type: AlertTypes.Warning }),
    error: message => setAlert({ message, type: AlertTypes.Error }),
    basic: message => setAlert({ message, type: AlertTypes.Basic }),
    clear: resetAlert
  }
}