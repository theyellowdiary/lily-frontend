import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import EmailMessage from 'models/EmailMessage';
import LilyDate from 'components/Utils/LilyDate';

class EmailDetail extends Component {
  constructor(props) {
    super(props);

    this.state = { emailMessage: null, plainText: false, recipients: [] };
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    const emailMessage = await EmailMessage.get(id);

    const threadRequest = await EmailMessage.thread(id);

    const recipientsList = emailMessage.receivedBy.concat(emailMessage.receivedByCc);

    const recipientRequests = recipientsList.map(async recipient => {
      if (recipient.name) {
        const recipientRequest = await EmailMessage.searchEmailAddress(recipient.emailAddress);

        if (recipientRequest.type === 'contact') {
          recipient.contactId = recipientRequest.data.id || null;
        }
      }

      return recipient;
    });

    const recipients = await Promise.all(recipientRequests);

    this.setState({ emailMessage, recipients, thread: threadRequest.results });
  }

  togglePlainText = () => {
    const { plainText } = this.state;

    this.setState({ plainText: !plainText });
  };

  toggleStarred = () => {
    const { emailMessage } = this.state;
    const data = { id: emailMessage.id, starred: !emailMessage.isStarred };

    EmailMessage.star(data).then(response => {
      emailMessage.isStarred = response.isStarred;

      this.setState({ emailMessage });
    });
  };

  archive = () => {
    const { emailMessage } = this.state;
    const data = { id: emailMessage.id, starred: !emailMessage.isStarred };

    EmailMessage.star(data).then(response => {
      emailMessage.isStarred = response.isStarred;

      this.setState({ emailMessage });
    });
  };

  render() {
    const { emailMessage, recipients, thread, plainText } = this.state;

    const recipientElements = recipients.map(recipient => {
      let element;

      if (recipient.name) {
        if (recipient.contactId) {
          element = (
            <React.Fragment>
              <Link to={`/contacts/${recipient.contactId}`} exact>
                {recipient.name}
              </Link>

              {` <${recipient.emailAddress}>`}
            </React.Fragment>
          );
        } else {
          element = (
            <React.Fragment>{`${recipient.name} <${recipient.emailAddress}>`}</React.Fragment>
          );
        }
      } else {
        element = recipient.emailAddress;
      }

      return <React.Fragment key={recipient.id}>{element}</React.Fragment>;
    });

    return (
      <div>
        {emailMessage ? (
          <div className="email-detail">
            <div className="email-subject">
              <span className="header">{emailMessage.subject}</span>
            </div>

            <div className="email-actions">
              <div className="hl-btn-group m-r-10">
                <button className="hl-primary-btn">
                  <FontAwesomeIcon icon="reply" /> Reply
                </button>

                <button className="hl-primary-btn">
                  <FontAwesomeIcon icon="angle-down" />
                </button>
              </div>

              <div className="hl-btn-group m-r-10">
                <button className="hl-primary-btn">
                  <FontAwesomeIcon icon="archive" /> Archive
                </button>
                <button className="hl-primary-btn">
                  <i className="lilicon hl-trashcan-icon" /> Delete
                </button>
              </div>

              <button className="hl-primary-btn">
                <FontAwesomeIcon icon="folder" /> Move to <FontAwesomeIcon icon="angle-down" />
              </button>
            </div>

            <div className="email-info">
              <div className="email-info-top">
                <strong>{emailMessage.sender.name}</strong>
                <span className="email-sender-email m-l-5">
                  &lt;{emailMessage.sender.emailAddress}&gt;
                </span>

                <button className="hl-interface-btn larger" onClick={this.toggleStarred}>
                  {emailMessage.isStarred ? (
                    <FontAwesomeIcon icon="star" className="yellow" />
                  ) : (
                    <FontAwesomeIcon icon={['far', 'star']} />
                  )}
                </button>

                <LilyDate date={emailMessage.sentDate} />
              </div>

              <div className="email-info-bottom">
                <div className="email-recipients">
                  <span>to </span>

                  {recipientElements.map((element, index) => (
                    <React.Fragment key={element.key}>
                      {element}
                      {index < recipientElements.length - 1 && <span>, </span>}
                    </React.Fragment>
                  ))}
                </div>

                <button className="no-border" onClick={this.togglePlainText}>
                  {plainText ? 'Show HTML' : 'Show plain text'}
                </button>
              </div>
            </div>

            <div className="email-content">
              {plainText ? (
                <div>{emailMessage.bodyText}</div>
              ) : (
                <iframe srcDoc={emailMessage.bodyHtml} title="Email message" />
              )}
            </div>
          </div>
        ) : (
          <div>Loading</div>
        )}
      </div>
    );
  }
}

export default EmailDetail;
