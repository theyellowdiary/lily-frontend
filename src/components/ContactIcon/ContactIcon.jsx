import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withNamespaces } from 'react-i18next';

import { NEEDS_ALL, NEEDS_CONTACT, NEEDS_ACCOUNT } from 'lib/constants';

import LilyTooltip from 'components/LilyTooltip';

const ContactIcon = props => {
  const { id, status } = props.emailMessage;
  const { t, tReady } = props;

  let icon;
  let tooltip;

  if (!tReady) return null;

  switch (status) {
    case NEEDS_ALL:
      icon = <i className="lilicon hl-company-icon grey" />;
      tooltip = t('contactIcon.needsEverything');
      break;
    case NEEDS_CONTACT:
      icon = <i className="lilicon hl-entity-icon aqua" />;
      tooltip = t('contactIcon.needsContact');
      break;
    case NEEDS_ACCOUNT:
      icon = <FontAwesomeIcon icon="check" className="yellow" />;
      tooltip = t('contactIcon.needsAccount');
      break;
    default:
      icon = <FontAwesomeIcon icon="check" className="green" />;
      tooltip = t('contactIcon.complete');
      break;
  }

  return (
    <React.Fragment>
      <div data-tip={tooltip} data-for={`status-${id}`}>
        {icon}
      </div>

      <LilyTooltip id={`status-${id}`} />
    </React.Fragment>
  );
};

export default withNamespaces('tooltips')(ContactIcon);
