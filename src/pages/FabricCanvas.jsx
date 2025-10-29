import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

// Approximate polygon coordinates for rooms based on the floorplan image
// Coordinates here are example values, should be adjusted according to actual image dimensions and scale
const rooms = [
  {
    label: "bedroom (29.01 m²)",
    points: [
      { x: 50, y: 100 }, { x: 350, y: 100 }, { x: 350, y: 400 }, { x: 50, y: 400 }
    ],
    fill: 'rgba(135, 206, 250, 0.4)'
  },
  {
    label: "balcony (5.67 m²)",
    points: [
      { x: 50, y: 50 }, { x: 125, y: 50 }, { x: 125, y: 100 }, { x: 50, y: 100 }
    ],
    fill: 'rgba(173, 216, 230, 0.4)'
  },
  {
    label: "bedroom (9.23 m²)",
    points: [
      { x: 360, y: 100 }, { x: 500, y: 100 }, { x: 500, y: 210 }, { x: 360, y: 210 }
    ],
    fill: 'rgba(135, 206, 235, 0.4)'
  },
  {
    label: "bedroom (7.84 m²)",
    points: [
      { x: 360, y: 215 }, { x: 500, y: 215 }, { x: 500, y: 290 }, { x: 360, y: 290 }
    ],
    fill: 'rgba(100, 149, 237, 0.4)'
  },
  {
    label: "Bathroom (4.67 m²)",
    points: [
      { x: 510, y: 215 }, { x: 560, y: 215 }, { x: 560, y: 290 }, { x: 510, y: 290 }
    ],
    fill: 'rgba(176, 196, 222, 0.4)'
  },
  {
    label: "bedroom (13.71 m²)",
    points: [
      { x: 360, y: 295 }, { x: 560, y: 295 }, { x: 560, y: 400 }, { x: 360, y: 400 }
    ],
    fill: 'rgba(70, 130, 180, 0.4)'
  },
  {
    label: "balcony (3.33 m²)",
    points: [
      { x: 50, y: 405 }, { x: 150, y: 405 }, { x: 150, y: 450 }, { x: 50, y: 450 }
    ],
    fill: 'rgba(135, 206, 250, 0.3)'
  }
];

export default function FabricCanvas({ imageBlob }) {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  useEffect(() => {
    fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
      width: 600,
      height: 500,
    });

    // Clean up on component unmount
    return () => {
      fabricCanvasRef.current.dispose();
    };
  }, []);

  useEffect(() => {
    if (imageBlob && fabricCanvasRef.current) {
      fabric.Image.fromURL(URL.createObjectURL(imageBlob), (img) => {
        // Scale image to fit canvas
        img.scaleToWidth(fabricCanvasRef.current.width);
        fabricCanvasRef.current.clear();
        fabricCanvasRef.current.add(img);
        fabricCanvasRef.current.sendToBack(img);

        // Add room polygons on top of image
        rooms.forEach((room) => {
          const polygon = new fabric.Polygon(room.points, {
            fill: room.fill,
            stroke: 'blue',
            strokeWidth: 2,
            selectable: true,
            objectCaching: false,
            transparentCorners: false,
            cornerColor: 'blue',
          });
          fabricCanvasRef.current.add(polygon);

          const centroidX = room.points.reduce((sum, p) => sum + p.x, 0) / room.points.length;
          const centroidY = room.points.reduce((sum, p) => sum + p.y, 0) / room.points.length;

          const text = new fabric.Text(room.label, {
            left: centroidX,
            top: centroidY,
            fontSize: 14,
            fill: 'black',
            selectable: false,
            originX: 'center',
            originY: 'center',
          });
          fabricCanvasRef.current.add(text);
        });

        fabricCanvasRef.current.renderAll();
      });
    }
  }, [imageBlob]);

  return <canvas ref={canvasRef} style={{ border: '1px solid #ccc' }} />;
}
