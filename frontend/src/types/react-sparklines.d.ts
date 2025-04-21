declare module 'react-sparklines' {
  import * as React from 'react';

  export interface SparklinesProps {
    data: Array<number>;
    limit?: number;
    width?: number;
    height?: number;
    margin?: number;
    min?: number;
    max?: number;
    svgWidth?: number;
    svgHeight?: number;
    preserveAspectRatio?: string;
    children?: React.ReactNode;
  }

  export interface SparklinesLineProps {
    color?: string;
    style?: React.CSSProperties;
    onMouseMove?: (event: React.MouseEvent) => void;
  }

  export interface SparklinesSpotProps {
    size?: number;
    style?: React.CSSProperties;
    spotColors?: {
      [key: string]: string;
    };
  }

  export class Sparklines extends React.Component<SparklinesProps> {}
  export class SparklinesLine extends React.Component<SparklinesLineProps> {}
  export class SparklinesSpots extends React.Component<SparklinesSpotProps> {}
  export class SparklinesBars extends React.Component<any> {}
  export class SparklinesReferenceLine extends React.Component<any> {}
  export class SparklinesNormalBand extends React.Component<any> {}
}