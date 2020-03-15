import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../Services/api';

import Container from '../../components/Container';
import { Form, SubmitButton, List } from './styles';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    errorValidValue: false,
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');
    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({
      newRepo: e.target.value,
    });
  };

  handleSubmit = async e => {
    e.preventDefault();
    try {
      this.setState({ loading: true });
      const { newRepo, repositories } = this.state;

      const checkRepo = repositories.find(repo => repo.name === newRepo);

      if (checkRepo) {
        throw new Error('Repositório duplicado');
      }

      const response = await api.get(`repos/${newRepo}`);
      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
        errorValidValue: false,
      });
    } catch (error) {
      this.setState({
        loading: false,
        errorValidValue: true,
      });
    }
  };

  render() {
    const { newRepo, repositories, loading, errorValidValue } = this.state;
    return (
      <Container>
        <h1>
          <FaGithubAlt /> Repositórios
        </h1>
        <Form onSubmit={this.handleSubmit} errorValidValue={errorValidValue}>
          <input
            type="text"
            placeholder="Adicionar Repostório"
            value={newRepo}
            onChange={this.handleInputChange}
          />
          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>
        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
