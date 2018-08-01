import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ContentBlock from 'components/ContentBlock';
import Editable from 'components/Editable';

const AccountDetailWidget = props => {
  const { account, submitCallback, clickable } = props;

  const title = (
    <React.Fragment>
      <div className="content-block-label" />
      <div className="content-block-name">
        <i className="lilicon hl-company-icon m-r-5" />
        {clickable &&
          !account.isDeleted && <Link to={`/accounts/${account.id}`}>{account.name}</Link>}

        {(!clickable || account.isDeleted) && <React.Fragment>{account.name}</React.Fragment>}
      </div>
    </React.Fragment>
  );

  return (
    <ContentBlock title={title} component="accountDetailWidget">
      <div className="detail-row">
        <div>
          <i className="lilicon hl-status-icon" /> Status
        </div>
        <div>
          <Editable type="select" object={account} field="status" submitCallback={submitCallback} />
        </div>
      </div>

      <div className="detail-row">
        <div>
          <i className="lilicon hl-email-icon" /> Email
        </div>
        <div>
          <Editable
            type="related"
            field="emailAddresses"
            object={account}
            submitCallback={submitCallback}
          />
        </div>
      </div>

      <div className="detail-row">
        <div>
          <i className="lilicon hl-phone-icon" /> Phone
        </div>
        <div>
          <Editable
            type="related"
            field="phoneNumbers"
            object={account}
            submitCallback={submitCallback}
          />
        </div>
      </div>

      <div className="detail-row">
        <div>
          <FontAwesomeIcon icon="globe" /> Website
        </div>
        <div>
          <Editable
            type="related"
            field="websites"
            object={account}
            submitCallback={submitCallback}
          />
        </div>
      </div>

      <div className="detail-row">
        <div>
          <i className="lilicon hl-entity-icon" /> Assigned to
        </div>
        <div>
          <Editable
            type="select"
            field="assignedTo"
            object={account}
            submitCallback={submitCallback}
          />
        </div>
      </div>

      <div className="detail-row">
        <div>
          <FontAwesomeIcon icon="map-marker-alt" /> Address
        </div>
        <div>
          <Editable
            type="related"
            field="addresses"
            object={account}
            submitCallback={submitCallback}
          />
        </div>
      </div>

      <div className="detail-row">
        <div>
          <FontAwesomeIcon icon={['fab', 'twitter']} /> Twitter
        </div>
        <div>
          {account.twitter && (
            <a href={account.twitter.profileUrl} target="_blank" rel="noopener noreferrer">
              {account.twitter.username}
            </a>
          )}
        </div>
      </div>

      <div className="detail-row">
        <div>
          <i className="lilicon hl-entity-icon" /> Customer ID
        </div>
        <div>
          <Editable
            type="text"
            field="customerId"
            object={account}
            submitCallback={submitCallback}
          />
        </div>
      </div>

      <div className="detail-row">
        <div>
          <FontAwesomeIcon icon="tags" /> Tags
        </div>
        <div>
          <Editable
            multi
            type="tags"
            field="tags"
            object={account}
            submitCallback={submitCallback}
          />
        </div>
      </div>

      <div className="detail-description">
        <div>
          <strong>Description</strong>
        </div>
        <Editable
          type="textarea"
          field="description"
          object={account}
          submitCallback={submitCallback}
        />
      </div>
    </ContentBlock>
  );
};

export default AccountDetailWidget;
