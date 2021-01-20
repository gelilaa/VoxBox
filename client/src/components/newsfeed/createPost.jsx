import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Form, Container, Button, Row, Col } from 'react-bootstrap'
import { logOut } from '../../store/actions/loginActions'
import { useHistory } from 'react-router-dom'


const CreatePost = (props) => {

  const [state, setState] = useState({
    topic: null,
    post_city: null,
    description: null,
    category: null
  })
   const [errorMessage, setErrorMessage] = useState('')

  const user_id = useSelector(state => state.user.user_id)

  const handleChange = (event) => {
   
    
    setState({
      ...state,
      [event.target.id]: event.target.value
    }
    )}
    const dispatch = useDispatch()
    const history = useHistory()

  const handleSubmit = (event) => {
    event.preventDefault()
        const post = {
          ...state,
        }
       // console.log("here you are",state)
        if(!state.topic||!state.category||!state.post_city||!state.description){
          const error1= "All fields are required"
         setErrorMessage(error1);
          return;
        }
        else{ 
        fetch(`/api/posts/${user_id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(post),
      })
      .then(response => response.json())
      .then(data => {
          if(data.auth === false){ 
                history.push('/session_expired')
                dispatch(logOut())
                 return
                }else{
                  if(data.status < 200 || data.status >= 300){
                 console.log('errors', data.message) 
                  setErrorMessage(data.message)
                  
                    }else {
                      props.formToggle()

                    }
                } 
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    
   
      
  }
}

  const style = {
    backgroundColor: '#E5E5E5',
    maxWidth: '900px',
    marginTop: '20px',
    marginBottom: '20px',
    borderRadius: '10px'
  }

  const buttonStyle = {
    marginTop: '20px',
    color: 'white',
    marginLeft: '10px'
  }

  const cancelButtonStyle = {
    marginTop: '20px',
    color: 'white',
    marginLeft: '10px',
    backgroundColor: 'gray', 
  }

  const titleStyle = {
    marginTop: '20px',
    marginBottom: '20px'
  }

  return (
    <Container style={style}> 
    <Row className="justify-content-center">
      <Col xs sm md lg xl>
      <h2 style={titleStyle} className="text-secondary row justify-content-center">Make a help request</h2>
        <Form>
          <Form.Group><Form.Control type="text"  placeholder="Title for help" id="topic" onChange={handleChange} required={true}/></Form.Group>
          <Form.Group><Form.Control type="text" maxLength="12" placeholder="Location where the help is needed" id="post_city" onChange={handleChange}  required={true}/></Form.Group>
          <Form.Group><Form.Control type="text"   maxLength="12" placeholder="Category of the help request" id="category" onChange={handleChange}   required={true}/></Form.Group>
          <Form.Group><Form.Control as="textarea" rows={3} placeholder="Description" id="description" onChange={handleChange} required={true}/></Form.Group>
           <p className="error-message">{errorMessage}</p>
          <Form.Group >
            <Button style={buttonStyle} variant="primary" type="submit" onClick={handleSubmit}>Post Help</Button>
            <Button style={cancelButtonStyle} variant="primary" type="submit" onClick={props.formToggle}>Cancel</Button>
          </Form.Group>
        </Form>
      </Col>
    </Row>
  </Container>
  )
}

export default CreatePost