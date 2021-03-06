import React, { Component } from 'react';
import { withNamespaces, Trans } from 'react-i18next';

import { del } from 'lib/api';
import { successToast, errorToast } from 'utils/toasts';
import LilyModal from 'components/LilyModal';

class DeleteConfirmation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalOpen: false
    };
  }

  openModal = () => {
    this.setState({ modalOpen: true });
  };

  closeModal = () => {
    this.setState({ modalOpen: false });
  };

  confirmDelete = async () => {
    const { item, deleteCallback, t } = this.props;

    try {
      if (item.contentType) {
        await del(`/${item.contentType.appLabel}/${item.id}/`);

        const text = t('toasts:modelDeleted', { model: item.contentType.model });
        successToast(text);
      }

      this.closeModal();

      if (deleteCallback) {
        deleteCallback(item);
      }
    } catch (error) {
      errorToast(t('toasts:error'));
    }
  };

  render() {
    const { item, showText, t } = this.props;

    // TODO: Think of a cleaner way.
    const display = item.name || item.fullName || item.subject || item.label;

    return (
      <React.Fragment>
        <button className="hl-primary-btn borderless m-l-5" onClick={this.openModal}>
          <i className="lilicon hl-trashcan-icon" />
          {showText && <span> Delete</span>}
        </button>

        <LilyModal modalOpen={this.state.modalOpen} closeModal={this.closeModal} alignCenter>
          <div className="modal-header">
            <div className="modal-title">{t('modals:delete.confirmTitle')}</div>
          </div>

          <div className="modal-content">
            <Trans
              defaults={t('modals:delete.confirmText', { name: display })}
              components={[<strong>text</strong>]}
            />
            <br />
            {t('modals:delete.confirmTextTwo')}
          </div>

          <div className="modal-footer">
            <button className="hl-primary-btn-red" onClick={this.confirmDelete}>
              Yes, delete
            </button>
            <button className="hl-primary-btn m-l-10" onClick={this.closeModal}>
              Cancel
            </button>
          </div>
        </LilyModal>
      </React.Fragment>
    );
  }
}

export default withNamespaces(['modals', 'toasts'])(DeleteConfirmation);
