import i18n from 'lib/i18n';

import { patch } from 'lib/api';
import { successToast, errorToast } from 'utils/toasts';

export default async function updateModel(item, data) {
  try {
    await patch(`/${item.contentType.appLabel}/${data.id}/`, data);

    const { model } = item.contentType;
    const text = i18n.t('toasts:modelUpdated', { model });

    successToast(text);
  } catch (e) {
    const text = i18n.t('toasts:error');

    errorToast(text);
  }
}