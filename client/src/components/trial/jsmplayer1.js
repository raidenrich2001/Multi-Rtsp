import React, { useEffect, useMemo, useRef } from 'react';
import JSMpeg from '@cycjimmy/jsmpeg-player';
import {useDispatch, useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { actions } from '../store/store';
import axios from '../api/axios';


function Jsmplayer() {
  const dispatch = useDispatch();
  const message = useSelector(state => state.mainStore.message)
  const navigate = useNavigate()

  // const inputRefs = useMemo(() => Array(2).fill(0).map(i=> React.createRef()), []);
 
  const RTSParray = useSelector(state => state.mainStore.RTSParray)
  const videoRefs = Array.from({ length: RTSParray.length }, () =>  React.createRef());
  const stopthis = Array.from({ length: RTSParray.length }, () => {return { start_stop: 'Stop'}})
  console.log(stopthis)

  useEffect(() => {
    const wsUrl = [];

    let sockets=[];
    // Create WebSocket connection
    RTSParray.map(client => {
      sockets.push(new WebSocket(`ws://${window.location.hostname}:${client.port}`));
      wsUrl.push(`ws://${window.location.hostname}:${client.port}`)

    })
    // wsUrl.map((url) => {
    //   sockets.push(new WebSocket(url));
    // })
   

    {sockets.map((socket,index) => {
      socket.onopen = () => {
        new JSMpeg.Player(wsUrl[index], {
          canvas: videoRefs[index]?.current,
          videoBufferSize: 768 * 1024,
        });
    };
  });}

    return () => {
      sockets.forEach(socket => {
      socket.close();
      })
    };
  }, []);

  function Stop(e) {
    axios.post('/',stopthis).then((res) => {
      {res.data.message === 'Disconnected Successfully' && navigate('/')};
      dispatch(actions.setMessage(res.data.message));
    }).catch((err) => {dispatch(actions.setMessage(err.response.data.message))})
  }

  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      axios.post('/',stopthis).then((res) => {
        dispatch(actions.setMessage(res.data.message))
    })
  };


    window.addEventListener('popstate', handleBackButton);

    return () => {
      if(message === 'Disconnected Successfully')
      {window.removeEventListener('popstate', handleBackButton);}
    };
  }, [message]);

  function ForceStop(e) {
    axios.post('/forceStop')
  }
  

  return (
    <div className='h-screen bg-black' id='fontthis'>
      <div className='w-full h-full relative'>
        
      <div className='grid grid-cols-3 gap-1 place-items-center place-content-start w-full h-[90%]'>
    { videoRefs.map((refs) => 
        <div className='w-full border'>
            <canvas className='w-full h-full' ref={refs} />
        </div>
    )}
    </div>

        <div className='absolute top-12 right-12'>
          <p className='text-white text-center my-2'>{message}</p>
          <button className={`py-1 px-8 bg-red-800 hover:bg-red-700 hover:duration-200 hover:opacity-100 text-white rounded-sm opacity-60`} onClick={(e) => Stop(e)} >Stop Stream</button>
          <button className={`py-1 px-8 bg-red-800 hover:bg-red-700 hover:duration-200 hover:opacity-100 text-white rounded-sm opacity-60`} onClick={(e) => ForceStop(e)} >Force Stop</button>
        </div>
      </div>
    </div>
  );
}

export default Jsmplayer;
