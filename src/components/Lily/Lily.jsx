import React, { Component, Fragment } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import ErrorBoundry from 'components/ErrorBoundry';
import withContext from 'src/withContext';
import Header from 'components/Header';
import Breadcrumbs from 'components/Breadcrumbs';
import Nav from 'components/Nav';
import Sidebar from 'components/Sidebar';
import Dashboard from 'pages/Dashboard';
import Login from 'pages/Login';
import Inbox from 'pages/Inbox';
import Preferences from 'pages/Preferences';
import AccountForm from 'pages/AccountForm';
import AccountDetail from 'pages/AccountDetail';
import AccountList from 'pages/AccountList';
import ContactForm from 'pages/ContactForm';
import ContactDetail from 'pages/ContactDetail';
import ContactList from 'pages/ContactList';
import DealForm from 'pages/DealForm';
import DealDetail from 'pages/DealDetail';
import DealList from 'pages/DealList';
import CaseForm from 'pages/CaseForm';
import CaseDetail from 'pages/CaseDetail';
import CaseList from 'pages/CaseList';
import NotFound from 'pages/NotFound';
import User from 'models/User';
import './icons';
// import history from '../../utils/history';
// import { get } from '../../lib/api/';

class Lily extends Component {
  constructor(props) {
    super(props);

    this.state = { loading: true, data: undefined };
  }

  async componentDidMount() {
    const currentUser = await User.me();

    this.props.setCurrentUser(currentUser);

    this.setState({ loading: false });
  }

  render() {
    const { loading } = this.state;

    if (loading) {
      return (
        <div className="column">
          <ErrorBoundry>
            <Nav />
          </ErrorBoundry>
        </div>
      );
    }

    return (
      <div className="lily">
        <Switch>
          <Route path="/login" exact>
            <ErrorBoundry>
              <Login />
            </ErrorBoundry>
          </Route>

          <Route path="*">
            <Fragment>
              <div className="column">
                <ErrorBoundry>
                  <Nav />
                </ErrorBoundry>
              </div>
              <div className="main">
                <ErrorBoundry>
                  <Header />
                </ErrorBoundry>
                <ErrorBoundry>
                  <Breadcrumbs />
                </ErrorBoundry>
                <main className="content" id="content">
                  <ErrorBoundry>
                    <Switch>
                      <Route path="/email" component={Inbox} />
                      <Route path="/preferences/*" component={Preferences} />

                      <Route path="/accounts/create" component={AccountForm} />
                      <Route path="/accounts/:id/edit" component={AccountForm} />
                      <Route path="/accounts/:id" component={AccountDetail} />
                      <Route path="/accounts" component={AccountList} />

                      <Route path="/contacts/create" component={ContactForm} />
                      <Route path="/contacts/:id/edit" component={ContactForm} />
                      <Route path="/contacts/:id" component={ContactDetail} />
                      <Route path="/contacts" component={ContactList} />

                      <Route path="/deals/create" component={DealForm} />
                      <Route path="/deals/:id/edit" component={DealForm} />
                      <Route path="/deals/:id" component={DealDetail} />
                      <Route path="/deals" component={DealList} />

                      <Route path="/cases/create" component={CaseForm} />
                      <Route path="/cases/:id/edit" component={CaseForm} />
                      <Route path="/cases/:id" component={CaseDetail} />
                      <Route path="/cases" component={CaseList} />

                      <Route path="/" component={Dashboard} />
                      <Redirect from="/" to="/" exact />
                      <Route path="*" component={NotFound} />
                    </Switch>
                  </ErrorBoundry>
                </main>

                <Sidebar />
              </div>
            </Fragment>
          </Route>
        </Switch>
      </div>
    );
  }
}

Lily.propTypes = {};

export default withContext(Lily);
