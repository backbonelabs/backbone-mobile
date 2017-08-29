import React, { Component, PropTypes } from 'react';
import { View, ART, Platform } from 'react-native';

const { Surface, Shape, Path, Group } = ART;

export default class CircularProgress extends Component {

  circlePath(cx, cy, r, startDegree, endDegree) {
    const p = Path(); // eslint-disable-line
    if (Platform.OS === 'ios') {
      p.path.push(0, cx + r, cy);
      p.path.push(4, cx, cy, r, (startDegree * Math.PI) / 180, (endDegree * Math.PI) / 180, 1);
    } else {
      // For Android we have to resort to drawing low-level Path primitives, as ART does not support
      // arbitrary circle segments. It also does not support strokeDash.
      // Furthermore, the ART implementation seems to be buggy/different than the iOS one.
      // MoveTo is not needed on Android
      p.path.push(
        4, cx, cy, r, (startDegree * Math.PI) / 180, ((startDegree - endDegree) * Math.PI) / 180, 0
      );
    }
    return p;
  }

  extractFill(fill) {
    if (fill < 0.01) {
      return 0;
    } else if (fill > 100) {
      return 100;
    }

    return fill;
  }

  render() {
    const {
      arcSweepAngle,
      size,
      width,
      tintColor,
      backgroundColor,
      style,
      rotation,
      linecap,
      children,
    } = this.props;
    const center = size / 2;
    const backgroundPath = this.circlePath(
      size / 2, size / 2, ((size / 2) - (width / 2)), 0, arcSweepAngle * 0.9999
    );
    const fill = this.extractFill(this.props.fill);
    const circlePath = this.circlePath(
      size / 2, size / 2, ((size / 2) - (width / 2)), 0, ((arcSweepAngle * 0.9999) * fill) / 100
    );
    return (
      <View style={style}>
        <Surface
          width={size}
          height={size}
        >
          <Group
            rotation={rotation + ((360 - arcSweepAngle) / 2)}
            originX={center}
            originY={center}
          >
            <Shape
              d={backgroundPath}
              stroke={backgroundColor}
              strokeWidth={width}
              strokeCap={linecap}
            />
            <Shape
              d={circlePath}
              stroke={tintColor}
              strokeWidth={width}
              strokeCap={linecap}
            />
          </Group>
        </Surface>
        {
          children
        }
      </View>
      );
  }
  }

CircularProgress.propTypes = {
  style: View.propTypes.style,
  size: PropTypes.number.isRequired,
  fill: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  tintColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  rotation: PropTypes.number,
  linecap: PropTypes.string,
  children: PropTypes.object,
  arcSweepAngle: PropTypes.number,
};

CircularProgress.defaultProps = {
  tintColor: 'black',
  backgroundColor: '#e4e4e4',
  rotation: 90,
  linecap: 'butt',
  arcSweepAngle: 360,
};
