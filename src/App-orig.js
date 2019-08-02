import React from 'react';
import { Box, Button, Grommet, Heading, Image, Stack, Text, Video } from 'grommet';
import { Add, Blank, Camera, Close } from 'grommet-icons';
import theme from './theme';

const BigButton = ({ background, Icon, title, onClick }) => (
  <Box
    round="full"
    overflow="hidden"
    background={background}
  >
    <Button
      title={title}
      icon={<Icon size="large" color="brand" />}
      hoverIndicator
      onClick={onClick}
    />
  </Box>
)

function App() {
  const [capture, setCapture] = React.useState()
  const [captureResolution, setCaptureResolution] = React.useState([0, 0]);
  const [monitorResolution, setMonitorResolution] = React.useState([0, 0]);
  const [images, setImages] = React.useState([]);
  const [error, setError] = React.useState();
  const captureRef = React.useRef();
  const videoRef = React.useRef();
  const canvasRef = React.useRef();

  React.useEffect(() => {
    const stored = localStorage.getItem('images');
    if (stored) {
      setImages(JSON.parse(stored));
    }
  }, []);

  const AddButton = () => (
    <BigButton
      title="add a photo"
      Icon={Add}
      onClick={() => {
        setCapture(true)
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          .then((stream) => {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          })
          .catch((err) => {
            setError(err.message);
          })
      }}
    />
  );

  return (
    <Grommet full theme={theme}>
      <Box>
        <Box
          direction="row"
          gap="large"
          justify="between"
          align="center"
          pad="medium"
        >
          <Heading level={1} margin="none">Photo Feed</Heading>
          {images.length > 0 && !capture && <AddButton />}
        </Box>
        {images.length === 0 && !capture && (
          <Box justify="center" align="center" style={{ minHeight: '80vh' }}>
            <AddButton />
          </Box>
        )}
        {error && <Text color="status-critical">{error}</Text>}
        {capture && (
          <Box ref={captureRef} style={{ minHeight: '80vh' }}>
            <Stack fill guidingChild="first">
              <canvas
                ref={canvasRef}
                width={monitorResolution[0]}
                height={monitorResolution[1]}
                style={{ width: '100%', height: '100%' }}
              />
              <Box fill overflow="hidden">
                <Video
                  ref={videoRef}
                  controls={false}
                  fit="cover"
                  onCanPlay={() => {
                    let rect = videoRef.current.getBoundingClientRect();
                    console.log('!!! capture at', rect.width, rect.height);
                    setCaptureResolution([rect.width, rect.height]);
                    rect = captureRef.current.getBoundingClientRect();
                    console.log('!!! monitor at', rect.width, rect.height);
                    setMonitorResolution([rect.width, rect.height]);
                  }}
                  style={{ height: '100%' }}
                />
              </Box>
              <Box fill pad="large" justify="end">
                <Box direction="row" justify="between" align="center">
                  <BigButton Icon={Blank} />
                  <BigButton
                    title="take picture"
                    Icon={Camera}
                    background={{ color: 'light-1', opacity: 'medium' }}
                    onClick={(event) => {
                      event.preventDefault();
                      const context = canvasRef.current.getContext('2d');
                      context.drawImage(videoRef.current, 0, 0,
                        captureResolution[0], captureResolution[1]);
                      const data = canvasRef.current.toDataURL('image/png');
                      const nextImages = [data, ...images];
                      setCapture(false);
                      setImages(nextImages);
                      localStorage.setItem('images', JSON.stringify(nextImages));
                    }}
                  />
                  <BigButton
                    title="cancel"
                    Icon={Close}
                    onClick={(event) => {
                      event.preventDefault();
                      setCapture(false);
                    }}
                  />
                </Box>
              </Box>
            </Stack>
          </Box>
        )}
        {images.map((image, index) => (
          <Stack key={index}>
            <Image fit="cover" src={image} />
            <Box fill pad="large" justify="end">
              <Box direction="row" justify="end" align="center">
                <BigButton
                  title="cancel"
                  Icon={Close}
                  onClick={(event) => {
                    event.preventDefault();
                    const nextImages = [...images];
                    nextImages.splice(index, 1);
                    setImages(nextImages);
                    localStorage.setItem('images', JSON.stringify(nextImages));
                  }}
                />
              </Box>
            </Box>
          </Stack>
        ))}
      </Box>
      
    </Grommet>
  );
}

export default App;
