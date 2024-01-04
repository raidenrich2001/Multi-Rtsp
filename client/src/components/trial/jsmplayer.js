import React, { useEffect, useRef } from 'react';
import JSMpeg from '@cycjimmy/jsmpeg-player';
import {useDispatch, useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { actions } from './store/store';
import axios from './api/axios';


function Jsmplayer() {
  const dispatch = useDispatch();
  const message = useSelector(state => state.mainStore.message)
  const videoRef = useRef(null);
  const navigate = useNavigate()

  useEffect(() => {
    const wsUrl = `ws://172.16.0.100:9996`;

    // Create WebSocket connection
    const socket = new WebSocket(wsUrl);

    // When the WebSocket connection is open, create the JSMpeg player
    socket.onopen = () => {
      if (videoRef.current) {
        new JSMpeg.Player(wsUrl, {
          canvas: videoRef.current,
          videoBufferSize: 768 * 1024,
        });
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  function Stop(e) {
    axios.post('/',{ start_stop: 'Stop' }).then((res) => {
      {res.data.message === 'Disconnected Successfully' && navigate('/')};
      dispatch(actions.setMessage(res.data.message));
    }).catch((err) => {dispatch(actions.setMessage(err.response.data.message))})
  }

  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      axios.post('/',{ start_stop: 'Stop' }).then((res) => {
        dispatch(actions.setMessage(res.data.message))
    })
  };

    window.addEventListener('popstate', handleBackButton);

    return () => {
      if(message === 'Disconnected Successfully')
      {window.removeEventListener('popstate', handleBackButton);}
    };
  }, [message]);

  

  return (
    <div className='h-screen bg-black' id='fontthis'>
      <div className='w-full h-full relative'>
        <canvas className='w-full h-full' ref={videoRef} />
        <div className='absolute top-12 right-12'>
          <p className='text-white text-center my-2'>{message}</p>
          <button className={`py-1 px-8 bg-red-800 hover:bg-red-700 hover:duration-200 hover:opacity-100 text-white rounded-sm opacity-60`} onClick={(e) => Stop(e)} >Stop Stream</button>
        </div>
      </div>
    </div>
  );
}

export default Jsmplayer;
