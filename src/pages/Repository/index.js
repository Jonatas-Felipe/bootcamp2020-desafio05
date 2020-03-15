import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../Services/api';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  GroupButton,
  IssuesButton,
  IssuesList,
  PageButton,
  PageButtonNumber,
} from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    stateIssue: 'open',
    page: 1,
    futureIssues: [],
  };

  async changeState() {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    const { stateIssue, page } = this.state;
    const [repository, issues] = await Promise.all([
      api.get(`repos/${repoName}`),
      api.get(`repos/${repoName}/issues`, {
        params: {
          state: stateIssue,
          page,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  async changeStateByFuturePages() {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    const { stateIssue, page } = this.state;
    const [repository, issues] = await Promise.all([
      api.get(`repos/${repoName}`),
      api.get(`repos/${repoName}/issues`, {
        params: {
          state: stateIssue,
          page: page + 1,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      futureIssues: issues.data,
    });
  }

  componentDidMount() {
    this.changeState();
    this.changeStateByFuturePages();
  }

  componentDidUpdate() {
    this.changeState();
    this.changeStateByFuturePages();
  }

  handleClickButton = issuesState => {
    this.setState({
      stateIssue: issuesState,
    });
  };

  handleClickButtonPage = opcao => {
    let { page } = this.state;
    if (opcao === 'voltar') {
      page -= 1;
    } else {
      page += 1;
    }

    this.setState({
      page,
    });

    this.changeState();
    this.changeStateByFuturePages();
  };

  render() {
    const {
      repository,
      issues,
      loading,
      stateIssue,
      page,
      futureIssues,
    } = this.state;

    if (loading) {
      return <Loading>Carregando...</Loading>;
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <GroupButton>
          <IssuesButton
            onClick={() => this.handleClickButton('all')}
            stateIssue={stateIssue === 'all'}
          >
            All
          </IssuesButton>
          <IssuesButton
            onClick={() => this.handleClickButton('open')}
            stateIssue={stateIssue === 'open'}
          >
            Open
          </IssuesButton>
          <IssuesButton
            onClick={() => this.handleClickButton('closed')}
            stateIssue={stateIssue === 'closed'}
          >
            Closed
          </IssuesButton>
        </GroupButton>
        <IssuesList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssuesList>
        <GroupButton>
          <PageButton
            onClick={() => this.handleClickButtonPage('voltar')}
            disabled={page === 1}
          >
            Voltar
          </PageButton>
          <PageButtonNumber>{page}</PageButtonNumber>
          <PageButton
            onClick={() => this.handleClickButtonPage('proximo')}
            disabled={futureIssues.length === 0}
          >
            Proximo
          </PageButton>
        </GroupButton>
      </Container>
    );
  }
}
