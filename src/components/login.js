import React from 'react';
import Button from "@material-ui/core/Button";
import {Container} from "@material-ui/core";
import Icon from "@material-ui/core/Icon";
import Grid from "@material-ui/core/Grid";

class Login extends React.Component {

    handleSubmit = (event) => {
        event.preventDefault()
        let url = "http://localhost:8081/login";
        let formData = new FormData();
        formData.append('username', event.target[0].value);
        formData.append('password',event.target[1].value);
        fetch(url, {
            method: 'post',
            mode: 'cors',
            body: formData
        }).then(function (response) {
            return response.text()
        }).then(function (body) {
            alert(body);
        });
    }
    render() {
        return (
            <form onSubmit={this.handleSubmit} className="login-form">
                <Container>
                <Grid>
                    <input placeholder="username"/>
                </Grid>
                <Grid>
                    <input type="password" placeholder="password"/>
                </Grid>
                <Grid>
                    <Button type="primary" htmlType="submit" className="login-form-button">
                        Login
                    </Button>
                </Grid>
                </Container>
            </form>
        );
    }
}

export default Login;