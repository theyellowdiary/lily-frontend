import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withNamespaces } from 'react-i18next';
import { debounce } from 'debounce';

import withContext from 'src/withContext';
import { ASCENDING_STATUS, DEBOUNCE_WAIT } from 'lib/constants';
import { successToast, errorToast } from 'utils/toasts';
import Editable from 'components/Editable';
import ColumnDisplay from 'components/List/ColumnDisplay';
import LilyPagination from 'components/LilyPagination';
import LilyTooltip from 'components/LilyTooltip';
import BlockUI from 'components/Utils/BlockUI';
import ListColumns from 'components/List/ListColumns';
import SearchBar from 'components/List/SearchBar';
import Settings from 'models/Settings';
import UserInvite from 'models/UserInvite';
import UserTeam from 'models/UserTeam';
import User from 'models/User';

class UserList extends Component {
  constructor(props) {
    super(props);

    this.mounted = false;
    this.settings = new Settings('userList');
    this.debouncedSearch = debounce(this.loadItems, DEBOUNCE_WAIT);

    const columns = [
      { key: 'fullName', text: 'Name', selected: true, sort: 'fullName' },
      { key: 'teams', text: 'Team(s)', selected: true, sort: 'teams.name' },
      { key: 'email', text: 'Email address', selected: true, sort: 'email' },
      { key: 'phoneNumber', text: 'Phone number', selected: true, sort: 'phoneNumber' },
      { key: 'internalNumber', text: 'Internal number', selected: true, sort: 'internalNumber' },
      { key: 'isActive', text: 'Status', selected: true, sort: 'isActive' }
    ];

    if (props.currentUser.isAdmin) {
      columns.push({ key: 'twoFactor', text: '2FA Active', selected: true });
    }

    this.state = {
      columns,
      users: [],
      invites: [],
      query: '',
      pagination: {},
      page: 1,
      statusFilter: 0,
      sortColumn: 'fullName',
      sortStatus: ASCENDING_STATUS,
      loading: true
    };

    document.title = 'Colleagues - Lily';
  }

  async componentDidMount() {
    this.mounted = true;

    const inviteResponse = await UserInvite.query({ pageSize: 20 });

    if (this.mounted) {
      this.setState({ invites: inviteResponse.results }, this.loadItems);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  setFilter = value => {
    this.setState({ statusFilter: value }, this.loadItems);
  };

  setPage = async page => {
    this.setState({ page }, this.loadItems);
  };

  setSorting = (sortColumn, sortStatus) => {
    this.setState({ sortColumn, sortStatus }, this.loadItems);
  };

  handleName = event => {
    const { newTeam } = this.state;

    newTeam.name = event.target.value;

    this.setState({ newTeam });
  };

  addTeam = () => {
    this.setState({ newTeam: { name: '' } });
  };

  saveNewTeam = () => {
    const { newTeam } = this.state;

    this.setState({ loading: true });

    UserTeam.post(newTeam).then(() => {
      this.setState({ newTeam: null, loading: false });
    });
  };

  cancelNewTeam = () => {
    this.setState({ newTeam: null });
  };

  toggleColumn = async index => {
    const { columns } = this.state;

    columns[index].selected = !columns[index].selected;

    await this.settings.store({ columns });
    this.setState({ columns });
  };

  handleSearch = query => {
    this.setState({ query }, this.debouncedSearch);
  };

  loadItems = async () => {
    const { statusFilter, page, sortColumn, sortStatus } = this.state;

    if (statusFilter === 3) {
      // Only display invites.
      if (this.mounted) {
        this.setState({ users: [] });
      }
      return;
    }

    if (this.mounted) {
      // Just calling loadItems doesn't re-render the Editable components.
      // So clear the users to make sure the list is up-to-date when edited.
      this.setState({ loading: true, users: [] });
    }

    const params = {
      pageSize: 20,
      page,
      sortColumn,
      sortStatus
    };

    if (statusFilter === 1) {
      params.isActive = 1;
    } else if (statusFilter === 2) {
      params.isActive = 0;
    }

    const data = await User.query(params);

    if (this.mounted) {
      this.setState({
        users: data.results,
        pagination: data.pagination,
        loading: false
      });
    }
  };

  submitCallback = async args => {
    const { t } = this.props;

    this.setState({ loading: true });

    try {
      await User.patch(args);

      successToast(t('modelUpdated', { model: 'user' }));

      this.setState({ loading: false }, this.loadItems);
    } catch (error) {
      errorToast(t('error'));
    }
  };

  submitInternalNumber = async args => {
    const { users } = this.state;
    const { t } = this.props;

    this.setState({ loading: true });

    const internalNumber = parseInt(args.internalNumber, 10);
    const foundUser = users.find(user => user.internalNumber === internalNumber);

    args.internalNumber = internalNumber || null;

    try {
      await User.patch(args);

      if (foundUser) {
        successToast(t('internalNumberCleared', { name: foundUser.fullName }));
      }

      const updatedUser = users.find(user => user.id === args.id);

      successToast(t('internalNumberCleared', { name: updatedUser.fullName }));

      this.setState({ loading: false }, this.loadItems);
    } catch (error) {
      errorToast(t('error'));
    }
  };

  toggleStatus = async item => {
    const { users } = this.state;
    const { t } = this.props;

    const isActive = !item.isActive;
    const args = {
      id: item.id,
      isActive
    };

    try {
      await User.patch(args);

      const index = users.findIndex(user => user.id === item.id);
      users[index].isActive = isActive;

      const text = isActive ? t('userActivated') : t('userDeactivated');
      successToast(text);

      this.setState({ users });
    } catch (error) {
      errorToast(t('error'));
    }
  };

  render() {
    const {
      columns,
      users,
      invites,
      query,
      statusFilter,
      newTeam,
      pagination,
      page,
      sortColumn,
      sortStatus,
      loading
    } = this.state;
    const { currentUser } = this.props;

    const filterOptions = ['All', 'Active', 'Inactive', 'Invited'];

    return (
      <BlockUI blocking={loading}>
        <div className="list">
          <div className="list-header">
            <div className="list-title flex-grow">Colleagues</div>

            <Link to="/preferences/invite" className="hl-primary-btn m-r-10">
              <FontAwesomeIcon icon="plus" /> User
            </Link>

            {currentUser.isAdmin && (
              <button className="hl-primary-btn" onClick={this.addTeam}>
                <FontAwesomeIcon icon="plus" /> Team
              </button>
            )}
          </div>
          <div className="list-header">
            <div className="flex-grow">
              <ColumnDisplay columns={columns} toggleColumn={this.toggleColumn} />
            </div>

            <div className="filter-group">
              {filterOptions.map((option, index) => {
                const buttonClassName = `hl-primary-btn${statusFilter === index ? ' active' : ''}`;

                return (
                  <button
                    key={`option-${option.toLowerCase()}`}
                    className={buttonClassName}
                    onClick={() => this.setFilter(index)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            <SearchBar query={query} searchCallback={this.handleSearch} />
          </div>

          <table className="hl-table">
            <thead>
              <tr>
                <ListColumns
                  columns={columns}
                  setSorting={this.setSorting}
                  sortColumn={sortColumn}
                  sortStatus={sortStatus}
                />
                <th className="table-actions">Actions</th>
              </tr>
            </thead>

            {newTeam && (
              <tbody>
                <tr>
                  <td colSpan="8">
                    <div className="editable-wrap display-flex">
                      <input
                        type="text"
                        className="editable-input editable-has-buttons"
                        onChange={this.handleName}
                      />
                      <span className="editable-buttons">
                        <button onClick={this.saveNewTeam}>
                          <FontAwesomeIcon icon="check" />
                        </button>
                        <button onClick={this.cancelNewTeam}>
                          <FontAwesomeIcon icon="times" />
                        </button>
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            )}

            <tbody>
              {(statusFilter === 0 || statusFilter === 3) && (
                <React.Fragment>
                  {invites.map(invite => (
                    <tr key={invite.id}>
                      <td>{invite.firstName}</td>
                      <td />
                      <td>{invite.email}</td>
                      <td colSpan="2" />
                      <td>
                        <div className="label info w-100">Invited</div>
                      </td>
                      <td />
                      <td>
                        <button className="hl-primary-btn borderless" type="button">
                          <FontAwesomeIcon icon="undo" />
                        </button>

                        <button className="hl-primary-btn borderless" type="button">
                          <i className="lilicon hl-trashcan-icon" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )}

              {users.map(user => (
                <tr key={user.id}>
                  {columns[0].selected && <td>{user.fullName}</td>}
                  {columns[1].selected && (
                    <td>
                      <Editable
                        multi
                        type="select"
                        field="teams"
                        object={user}
                        submitCallback={this.submitCallback}
                      />
                    </td>
                  )}
                  {columns[2].selected && <td>{user.email}</td>}
                  {columns[3].selected && <td>{user.phoneNumber}</td>}
                  {columns[4].selected && (
                    <td>
                      {currentUser.isAdmin ? (
                        <Editable
                          type="text"
                          object={user}
                          field="internalNumber"
                          submitCallback={this.submitInternalNumber}
                        />
                      ) : (
                        <React.Fragment>{user.internalNumber}</React.Fragment>
                      )}
                    </td>
                  )}
                  {columns[5].selected && (
                    <td>
                      <div className={`label w-100 ${user.isActive ? 'success' : ''}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </td>
                  )}
                  {columns[6].selected && (
                    <React.Fragment>
                      {currentUser.isAdmin ? (
                        <td>{user.hasTwoFactor && <FontAwesomeIcon icon="lock" />}</td>
                      ) : (
                        <td />
                      )}
                    </React.Fragment>
                  )}
                  <td>
                    <button
                      className="hl-primary-btn borderless"
                      onClick={() => this.toggleStatus(user)}
                      data-tip={`${user.isActive ? 'Deactivate' : 'Activate'} colleague`}
                      data-for={`user-${user.id}`}
                    >
                      {user.isActive ? (
                        <i className="lilicon hl-entity-status-inactive-icon" />
                      ) : (
                        <i className="lilicon hl-entity-status-active-icon" />
                      )}
                    </button>

                    <LilyTooltip id={`user-${user.id}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="list-footer">
            <LilyPagination setPage={this.setPage} pagination={pagination} page={page} />
          </div>
        </div>
      </BlockUI>
    );
  }
}

export default withNamespaces('toasts')(withContext(UserList));
