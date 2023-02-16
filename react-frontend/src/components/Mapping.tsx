import { Grid, Select, MenuItem, Button } from '@mui/material'
import { Route } from '../utils/models'
import { FormEvent, FunctionComponent, useCallback, useEffect, useRef, useState } from 'react'
import { Loader } from 'google-maps'
import { getCurrentPosition } from '../utils/geolocation';
import { makeCarIcon, makeMarkerIcon, Map } from '../utils/map'
import { sample, shuffle } from 'lodash'
import { RouteExistsError } from '../errors/route-exists.error';
import { useSnackbar } from 'notistack';
import { makeStyles } from 'tss-react/mui';
import { Navbar } from './Navbar';
import io from 'socket.io-client';

interface Props {

}

const API_URL = import.meta.env.VITE_API_URL;

const googleMapsLoader = new Loader(import.meta.env.VITE_GOOGLE_API_KEY);

const colors = [
  '#FF1166',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FFA500',
  '#800080',
  '#FFC0CB',
  '#A52A2A',
  '#000000',
  '#808080',
];

const useStyles = makeStyles()((theme) => {
  return {
    root: {
      width: '100%',
      height: '100%',
    },
    form: {
      margin: '16px',
    },
    btnSubmitWrapper: {
      textAlign: 'center',
      marginTop: '8px'
    },
    map: {
      width: '100%',
      height: '100%',
    }
  }
});

export const Mapping: FunctionComponent = ({ }: Props) => {
  const { classes } = useStyles();
  const [routes, setRoutes] = useState<Route[]>([])
  const [selectedIdRoute, setSelectedIdRoute] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const mapRef = useRef<Map>();
  const socketIORef = useRef<SocketIOClient.Socket>();

  const finishRoute = useCallback(
    (route: Route) => {
      enqueueSnackbar(`${route.title} finalizou!`, {
        variant: "success",
      });
      mapRef.current?.removeRoute(route._id);
    },
    [enqueueSnackbar]
  );

  useEffect(() => {
    if (!socketIORef.current?.connected) {
      socketIORef.current = io.connect(API_URL);
      socketIORef.current.on("connect", () => console.log("conectou"));
    }

    const handler = (data: {
      routeId: string;
      position: [number, number];
      finished: boolean;
    }) => {
      console.log(data);
      mapRef.current?.moveCurrentMarker(data.routeId, {
        lat: data.position[0],
        lng: data.position[1],
      });
      const route = routes.find((route) => route._id === data.routeId) as Route;
      if (data.finished) {
        finishRoute(route);
      }
    };
    socketIORef.current?.on("new-position", handler);
    return () => {
      socketIORef.current?.off("new-position", handler);
    };
  }, [finishRoute, routes, setSelectedIdRoute]);

  useEffect(() => {

    fetch(`${API_URL}/routes`)
      .then(res => res.json())
      .then(data => {
        setRoutes(data)
        console.log(data)
      })

  }, [])

  useEffect(() => {
    (async () => {
      const [, position] = await Promise.all([
        googleMapsLoader.load(),
        getCurrentPosition({ enableHighAccuracy: true })
      ])
      const divMap = document.getElementById('map') as HTMLDivElement;
      mapRef.current = new Map(divMap, {
        center: position,
        zoom: 15
      })
    })()
  }, [])


  const startRoute = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      const route = routes.find((route) => route._id === selectedIdRoute);
      const color = sample(shuffle(colors)) as string;
      try {
        mapRef.current?.addRoute(selectedIdRoute, {
          currentMarkerOptions: {
            position: route?.startPosition,
            icon: makeCarIcon(color),
          },
          endMarkerOptions: {
            position: route?.endPosition,
            icon: makeMarkerIcon(color),
          },
        });
        socketIORef.current?.emit("new-direction", {
          routeId: selectedIdRoute,
        });
      } catch (error) {
        if (error instanceof RouteExistsError) {
          enqueueSnackbar(`${route?.title} já adicionado, espere finalizar.`, {
            variant: "error",
          });
          return;
        }
        throw error;
      }
    },
    [selectedIdRoute, routes, enqueueSnackbar]
  );


  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} sm={3} >
        <Navbar />
        <form onSubmit={startRoute} className={classes.form}>
          <Select fullWidth value={selectedIdRoute} displayEmpty onChange={(event) => setSelectedIdRoute(event.target.value)}>
            <MenuItem value="">Selecione uma Rota</MenuItem>
            {
              routes && routes.map(route => (
                <MenuItem key={route._id} value={route._id}>{route.title}</MenuItem>
              ))
            }
          </Select>
          <div className={classes.btnSubmitWrapper}>
            <Button type='submit' variant="contained" color="primary">Iniciar Corrida</Button>
          </div>
        </form>
      </Grid>
      <Grid item xs={12} sm={9}>
        <div id="map" className={classes.map} />
      </Grid>
    </Grid>
  )
}
