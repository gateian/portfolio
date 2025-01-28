import styled from '@emotion/styled';
import { useDebugState } from './useDebugState';
import { Overlay } from '../StyledComponents';

const CameraPosition = styled('div')({
  padding: '10px',
  background: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  position: 'absolute',
  top: '0px',
  left: '100px',
  borderRadius: '5px',
  lineHeight: '10px',
});

const CopyButton = styled('button')({
  padding: '10px',
  background: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  borderRadius: '5px',
  lineHeight: '10px',
  cursor: 'pointer',
  pointerEvents: 'auto',
  border: 'none',
  '&:hover': {
    background: 'rgba(0, 0, 0, 0.9)',
  },
});

function Debug2D() {
  const { cameraPosition } = useDebugState();

  return (
    <Overlay>
      <CameraPosition>
        <h3>Camera Position</h3>
        <p>
          Y:
          {cameraPosition?.y.toFixed(2) || '-'}
        </p>
        <p>
          Z:
          {cameraPosition?.z.toFixed(2) || '-'}
        </p>
        <p>
          X:
          {cameraPosition?.x.toFixed(2) || '-'}
        </p>
        <CopyButton
          onClick={() => {
            if (cameraPosition) {
              const vector3String = `Vector3(${cameraPosition.x.toFixed(
                2
              )}, ${cameraPosition.y.toFixed(2)}, ${cameraPosition.z.toFixed(
                2
              )})`;
              navigator.clipboard
                .writeText(vector3String)
                .then(() => alert('Camera position copied to clipboard!'))
                .catch((err) => console.error('Failed to copy: ', err));
            }
          }}
        >
          Copy Position
        </CopyButton>
      </CameraPosition>
    </Overlay>
  );
}

export default Debug2D;
