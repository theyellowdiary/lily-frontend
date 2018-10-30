import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withNamespaces } from 'react-i18next';

import { del } from 'lib/api';
import { successToast, errorToast } from 'utils/toasts';
import BlockUI from 'components/Utils/BlockUI';
import DeleteConfirmation from 'components/Utils/DeleteConfirmation';
import TemplateVariable from 'models/TemplateVariable';

class TemplateVariableList extends Component {
  constructor(props) {
    super(props);

    this.state = { variables: [], publicVariables: [], loading: true };

    document.title = 'Template variables - Lily';
  }

  async componentDidMount() {
    const variableResponse = await TemplateVariable.query();
    const variables = variableResponse.custom.filter(variable => !variable.isPublic);
    const publicVariables = variableResponse.custom.filter(variable => variable.isPublic);

    this.setState({
      variables,
      publicVariables,
      loading: false
    });
  }

  removeItem = async item => {
    const { variables } = this.state;
    const { t } = this.props;

    try {
      await del(`/messaging/email/template-variables/${item.id}/`);

      const text = t('toasts:modelDeleted', { model: 'template variable' });
      successToast(text);

      const index = variables.findIndex(variable => variable.id === item.id);
      variables.splice(index, 1);

      this.setState({ variables });
    } catch (error) {
      errorToast(t('toasts:error'));
    }
  };

  render() {
    const { variables, publicVariables, loading } = this.state;
    const { t } = this.props;

    return (
      <BlockUI blocking={loading}>
        <div className="list">
          <div className="list-header">
            <div className="list-title flex-grow">Your template variables</div>

            <Link className="hl-primary-btn" to="/preferences/templatevariables/create">
              <FontAwesomeIcon icon="plus" /> Template variable
            </Link>
          </div>
          <table className="hl-table">
            <thead>
              <tr>
                <th className="w-60">Template name</th>
                <th className="float-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {variables.map(variable => (
                <tr key={variable.id}>
                  <td>{variable.name}</td>
                  <td className="float-right">
                    <button className="hl-primary-btn borderless">
                      <FontAwesomeIcon icon="eye" /> Preview
                    </button>

                    <Link
                      to={`/preferences/templatevariables/edit/${variable.id}`}
                      className="hl-primary-btn borderless"
                    >
                      <i className="lilicon hl-edit-icon" />
                    </Link>

                    <DeleteConfirmation item={variable} deleteCallback={this.removeItem} />
                  </td>
                </tr>
              ))}
            </tbody>

            {variables.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan="2">{t('emptyStates:preferences.noVariables')}</td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        <div className="m-b-25" />

        <div className="list">
          <div className="list-header">
            <div className="list-title flex-grow">Public template variables</div>
          </div>
          <table className="hl-table">
            <thead>
              <tr>
                <th className="w-60">Template name</th>
                <th className="float-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {publicVariables.map(variable => (
                <tr key={variable.id}>
                  <td>{variable.name}</td>
                  <td className="float-right">
                    <button className="hl-primary-btn small m-r-5">
                      <FontAwesomeIcon icon="eye" /> Preview
                    </button>

                    <button className="hl-primary-btn small m-r-5">
                      <i className="lilicon hl-edit-icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {publicVariables.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan="2">{t('emptyStates:preferences.noPublicVariables')}</td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </BlockUI>
    );
  }
}

export default withNamespaces(['emptyStates', 'toasts'])(TemplateVariableList);
