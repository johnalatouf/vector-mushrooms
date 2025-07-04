import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Mushroom } from '../models/mushroom.model';

@Component({
  selector: 'app-mushrooms',
  standalone: false,
  // imports: [],
  templateUrl: './mushrooms.component.html',
  styleUrl: './mushrooms.component.scss'
})
export class BackgroundImageComponent implements AfterViewInit {
  // its important myCanvas matches the variable name in the template
  @ViewChild('myCanvas')
  canvas: ElementRef<HTMLCanvasElement> | null = null;

  context: CanvasRenderingContext2D | null = null;
  totalMushrooms: number = 6;

  ngAfterViewInit(): void {
    if (this.canvas) {
      this.context = this.canvas.nativeElement.getContext('2d');
      
    }
    this.loadMushrooms();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // redraw when window size changes
    this.loadMushrooms();
  }

  loadMushrooms() {
    if (this.context) {
      this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
      const windowInnerWidth = window.innerWidth;
      const windowInnerHeight = window.innerHeight;
      this.context.canvas.width = windowInnerWidth;
      this.context.canvas.height = windowInnerHeight;
      this.context.fillStyle = "#a3ffe2";
      this.context.fillRect(0, 0, windowInnerWidth, windowInnerHeight);

      const bigMushroomPath = this.mushroomPath([0,windowInnerHeight*0.6], [windowInnerWidth*0.3, windowInnerHeight*0.4], [windowInnerWidth*0.65, windowInnerHeight*0.65], [windowInnerWidth - 100, windowInnerHeight*0.95], 10)
      this.drawMushroomsOnPath(bigMushroomPath, [100, 220], [-75, 75], [15, 30], [70, 150], 20, 0.5, 10);

      const smallMushroomPath = this.mushroomPath([0, windowInnerHeight*0.9], [windowInnerWidth*0.15, windowInnerHeight*0.4], [windowInnerWidth*0.65, windowInnerHeight*0.8], [windowInnerWidth - 100, windowInnerHeight*0.95], 12)
      this.drawMushroomsOnPath(smallMushroomPath, [80, 180], [-35, 35], [10, 15], [30, 100], 10, 0.25, 4);
    }
  }

  drawMushroomsOnPath(mushroomPath: number[][], heightRange: number[], curveRange: number[], capRadiusRange: number[], capCircleRadiusRange: number[], heightShrinkAmount = 10, capBaseShrinkAmount = 0.5, capTopShrinkAmount = 5) {
    const mushrooms:Mushroom[] = [];
    const bigPoint = Math.ceil(mushroomPath.length/2);
    for (let i=1; i<mushroomPath.length; i++) {
      const stray = Math.abs(bigPoint - i);
      const shrinkChange = stray* heightShrinkAmount;
      const capShrinkChange = stray* capBaseShrinkAmount;
      const capTopShrinkChange = stray* capTopShrinkAmount;
      console.log(capShrinkChange, capTopShrinkChange);
      const pathPoint = mushroomPath[i];
      const spread = 30;
      const rx = this.randomIntFromInterval(pathPoint[0] - spread, pathPoint[0] + spread);
      const ry = this.randomIntFromInterval(pathPoint[1] - spread, pathPoint[1] + spread);
      const capRadius = this.randomIntFromInterval(capRadiusRange[0] - capShrinkChange, capRadiusRange[1] - capShrinkChange);
      const capCircleRadius = this.randomIntFromInterval(capCircleRadiusRange[0] - capTopShrinkChange, capCircleRadiusRange[1] - capTopShrinkChange);
      mushrooms.push(
        this.generateMushroom(
          [rx, ry], 
          [heightRange[0] - shrinkChange, heightRange[1] - shrinkChange], 
          curveRange,  
          capRadius, 
          capCircleRadius > capRadius ? capCircleRadius : capRadius
        )
      );
    }
    mushrooms.forEach((m, i) => {
      this.drawFilledMushroom(m);
    })
  }

  generateMushroom(start: number[], heighRange: number[], curveRange: number[], capRadius: number, capCircleRadius: number) {
    const height = this.randomIntFromInterval(heighRange[0], heighRange[1]);
    const curve = this.randomIntFromInterval(curveRange[0], curveRange[1]);
    const curveX = this.randomIntFromInterval(start[0] + curve, start[0] + curve);
    const curveY = this.randomIntFromInterval(start[1] - height /2, start[1]);

    const stalkRandom = this.randomIntFromInterval(-10, 10);

    const endpoint = [start[0] + stalkRandom, start[1] - height];

    const capBase = {
      radius: capRadius,
      center: endpoint
    }

    const capCircle = {
      radius: capCircleRadius,
      center: [endpoint[0], endpoint[1] - 10]
    }

    const capTop = [endpoint[0], endpoint[1] + 30]

    const mushroom: Mushroom = {
      root: start,
      stalkEnd: endpoint,
      capBase: capBase,
      capCircle: capCircle,
      stalkCurvePoint: [curveX, curveY],
      capTop: capTop,
      stalkBaseRadius: capBase.radius + 10
    }
    return mushroom;
  }

  randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  drawMushroom(mushroom: Mushroom) {
  const start = mushroom.root;
  const curve = mushroom.stalkCurvePoint;
  const end = mushroom.stalkEnd;
    if (this.context) {
      // stalk left
      this.drawCurvedLine(
        this.context, 
        [mushroom.root[0] - mushroom.stalkBaseRadius, mushroom.root[1]],
        [mushroom.stalkEnd[0] - mushroom.capBase.radius, mushroom.stalkEnd[1]],
        curve
      );

      // stalk right
      this.drawCurvedLine(
        this.context, 
        [mushroom.root[0] + mushroom.stalkBaseRadius, mushroom.root[1]],
        [mushroom.stalkEnd[0] + mushroom.capBase.radius, mushroom.stalkEnd[1]],
        curve
      );

      const capCircle = {
        cx: mushroom.capCircle.center[0],
        cy: mushroom.capCircle.center[1],
        rx: mushroom.capCircle.radius,
        ry: 5
      };

      const capBase = {
        cx: mushroom.capBase.center[0],
        cy: mushroom.capBase.center[1],
        rx: mushroom.capBase.radius,
        ry: 5,
      }

      // cap circle
      this.ellipse(this.context, 
        capCircle.cx,
        capCircle.cy,
        capCircle.rx,
        capCircle.ry
      )

      // TEST A GILL
      this.drawGill(
        this.context,
        capBase,
        capCircle,
        capCircle.cy - 5, // TODO: calculate
        'white',
        'black'
      )

      // cap top
      this.ellipse(this.context, 
        mushroom.capCircle.center[0],
        mushroom.capCircle.center[1],
        mushroom.capCircle.radius,
        mushroom.capTop[1] - mushroom.capCircle.center[1],
        true
      )

      // stalk base
      this.ellipse(this.context, 
        mushroom.root[0],
        mushroom.root[1],
        mushroom.stalkBaseRadius,
        -5,
        true
      )
    }
    
  }

  dotsInAnEllipse(context: any, numPoints: number, cx: number, cy: number, rx: number, ry: number, half=false, maskRx: number, maskRy: number) {
    let maxRadians = Math.PI;
    if (!half) {
      maxRadians = 2 * Math.PI;
    }
    for (let i=0; i<=numPoints; i++) {
      // x = r cos Theta, y = r sin Theta
      const randomR = this.randomIntFromInterval(maskRx, rx);
      const randomY = this.randomIntFromInterval(maskRy, ry);
      const randomRadians = Math.random() * maxRadians;
      const x = randomR * Math.cos(randomRadians) + cx;
      const y = cy - randomY * Math.sin(randomRadians);
      const randomDotSize = this.randomIntFromInterval(2, 5);
      this.ellipse(context, x, y, 
        randomDotSize,
        randomDotSize,
        false, 
        `rgba(${this.randomIntFromInterval(230, 250)}, ${this.randomIntFromInterval(230, 250)}, ${this.randomIntFromInterval(230, 250)}, 0.8)`, 
        'grey');
    }
    
  }

  ellipse(context: any, cx: number, cy: number, rx: number, ry: number, half=false, fill: string | CanvasGradient | null = null, stroke: string | CanvasGradient | null = null, lineWidth: number | null = null){
    context.save(); // save state
    context.beginPath();

    context.translate(cx-rx, cy-ry);
    context.scale(rx, ry);
    context.arc(1, 1, 1, half ? Math.PI : 0, 2 * Math.PI, false);

    context.restore(); 
    if (fill) {
      context.fillStyle = fill;
      context.fill();
    } else {
      context.strokeStyle = stroke ?? 'black';
      context.lineWidth = lineWidth ?? 0.75;
      context.stroke();
    }
  }

  ellipsePartialStroke(context: any, cx: number, cy: number, rx: number, ry: number, startPoint: number, endPoint: number, stroke: string | CanvasGradient | null = null, lineWidth: number | null = null){
    context.save(); // save state
    context.beginPath();

    context.translate(cx-rx, cy-ry);
    context.scale(rx, ry);
    // half ? Math.PI : 0, 2 * Math.PI
    context.arc(1, 1, 1, startPoint, endPoint, false);

    context.restore(); 
  
    context.strokeStyle = stroke ?? 'black';
    context.lineWidth = lineWidth ?? 0.75;
    context.stroke();
    
  }

  ellipseWithinPath(context: any, cx: number, cy: number, rx: number, ry: number, half=false){
    context.save(); // save state
    context.translate(cx-rx, cy-ry);
    context.scale(rx, ry);
    context.arc(1, 1, 1, half ? Math.PI : 0, 2 * Math.PI, false);
    context.restore(); 
  }

  drawFilledMushroom(mushroom: Mushroom) {
    const start = mushroom.root;
    const curve = mushroom.stalkCurvePoint;
    const end = mushroom.stalkEnd;
    const st1 = this.randomIntFromInterval(220, 228);
    const st2 = this.randomIntFromInterval(237, 235);
    const st3 = this.randomIntFromInterval(229, 233);
    const stemColor = `rgb(${st1}, ${st2}, ${st3})`;
    const stemColorTrans = `rgba(${st1}, ${st2}, ${st3}, 0.0)`;
    const stemColorWhite = `rgb(${st1 + 20}, ${st2 + 20}, ${st3 + 20})`;
    const stemGreen = `rgb(${st1 - 20}, ${st2 + 20}, ${st3 - 20})`;
    const stemColorDark = `rgb(${st1 - 15}, ${st2 - 25}, ${st3 - 35})`;
    const stemColorVeryDark = `rgb(${st1 - 25}, ${st2 - 35}, ${st3 - 45})`;
    const gillColor = `rgba(${st1 - 75}, ${st2 - 85}, ${st3 - 105}, 1.0)`;
    const capColorNumbers = [this.randomIntFromInterval(255, 235), this.randomIntFromInterval(182, 133), this.randomIntFromInterval(37, 33)]
    const capColor = `rgb(${capColorNumbers[0]}, 
        ${capColorNumbers[1]}, 
        ${capColorNumbers[2]})`;
    const capColorLight = `rgb(${capColorNumbers[0] + 20}, 
        ${capColorNumbers[1] + 20}, 
        ${capColorNumbers[2] + 20})`;
      if (this.context) {
        this.context.beginPath();

        // stalk left
        this.drawCurvedLineWithinPath(
          this.context, 
  
          [mushroom.stalkEnd[0] - mushroom.capBase.radius, mushroom.stalkEnd[1]],
          [mushroom.root[0] - mushroom.stalkBaseRadius, mushroom.root[1]],
          curve
        );
  
        this.drawCurvedLineWithinPath(
          this.context, 
          [mushroom.root[0] - mushroom.stalkBaseRadius, mushroom.root[1]],
          [mushroom.root[0] + mushroom.stalkBaseRadius, mushroom.root[1]],
          // mushroom.root
          [mushroom.root[0], mushroom.root[1] + mushroom.stalkBaseRadius/2]
        );
  
        // stalk right
        this.drawCurvedLineWithinPath(
          this.context, 
          [mushroom.root[0] + mushroom.stalkBaseRadius, mushroom.root[1]],
          [mushroom.stalkEnd[0] + mushroom.capBase.radius, mushroom.stalkEnd[1]],
          curve
        );

        const capBase = {
          cx: mushroom.capBase.center[0],
          cy: mushroom.capBase.center[1],
          rx: mushroom.capBase.radius,
          ry: 5,
        }
  
        this.drawCurvedLineWithinPath(
          this.context, 
          [mushroom.stalkEnd[0] + mushroom.capBase.radius, mushroom.stalkEnd[1]],
          [mushroom.stalkEnd[0] - mushroom.capBase.radius, mushroom.stalkEnd[1]],
          [mushroom.stalkEnd[0], mushroom.stalkEnd[1] - capBase.ry]
        );
        
        //stemGreen
        const stemGrad = this.context.createLinearGradient(capBase.cy, capBase.cy, capBase.cy, mushroom.root[1]);
        stemGrad.addColorStop(0, stemColor);
        stemGrad.addColorStop(0.2, stemColor);
        stemGrad.addColorStop(0.35, stemColorWhite);
        stemGrad.addColorStop(0.65, stemColorWhite);
        stemGrad.addColorStop(1, stemGreen);
        
        this.context.fillStyle = stemGrad;
        this.context.fill();
        const strokeStemGrad = this.context.createLinearGradient(capBase.cy, capBase.cy, capBase.cy, mushroom.root[1]);
        strokeStemGrad.addColorStop(0, stemColorDark);
        const stemGreenDark = `rgb(${st1 - 40}, ${st2 + 10}, ${st3 - 40})`;
        strokeStemGrad.addColorStop(1, stemGreenDark);
        this.context.strokeStyle = strokeStemGrad;
        this.context.lineWidth = 0.9;
        this.context.stroke();
  
        const capCircle = {
          cx: mushroom.capCircle.center[0],
          cy: mushroom.capCircle.center[1],
          rx: mushroom.capCircle.radius,
          ry: 5
        };

        // cap outline
        this.ellipse(this.context, 
          mushroom.capCircle.center[0],
          mushroom.capCircle.center[1],
          mushroom.capCircle.radius,
          mushroom.capTop[1] - mushroom.capCircle.center[1],
          true,
          null,
          capColorLight,
          3
        )

        // cap top
        this.ellipse(this.context, 
          mushroom.capCircle.center[0],
          mushroom.capCircle.center[1],
          mushroom.capCircle.radius,
          mushroom.capTop[1] - mushroom.capCircle.center[1],
          true,
          capColor,
          null,
          null
        )

        const capCircleGrad = this.context.createRadialGradient(
          capCircle.cx,
          capCircle.cy + 15,
          capCircle.ry,
          capCircle.cx,
          capCircle.cy + 20,
          capCircle.rx,
        );
        capCircleGrad.addColorStop(0, stemColorDark);
        capCircleGrad.addColorStop(0.35, stemColorDark);
        capCircleGrad.addColorStop(0.55, stemColorDark);
        capCircleGrad.addColorStop(1, stemColorVeryDark);
  
        // cap circle
        this.ellipse(this.context, 
          capCircle.cx,
          capCircle.cy,
          capCircle.rx,
          capCircle.ry,
          false,
          capCircleGrad, // TODO: gradient
          null,
          null
        )
  
        // TEST A GILL
        this.drawGillBackground(
          this.context,
          capBase,
          capCircle,
          capCircle.cy - 5, // TODO: calculate
          stemColor,
          stemColorDark,
        )

        this.drawGill(
          this.context,
          capBase,
          capCircle,
          capCircle.cy - 5, // TODO: calculate
          stemColorTrans,
          gillColor,
        )

        // make a cap lip
        this.ellipsePartialStroke(this.context, 
          capCircle.cx,
          capCircle.cy,
          capCircle.rx,
          capCircle.ry,
          Math.PI * 3/4,
          Math.PI * 1/4,
          capColor,
          1
        )



        // cap top dots
        this.dotsInAnEllipse(
          this.context,
          this.randomIntFromInterval(0, 15),
          mushroom.capCircle.center[0],
          mushroom.capCircle.center[1],
          mushroom.capCircle.radius,
          mushroom.capTop[1] - mushroom.capCircle.center[1],
          true,
          capCircle.rx,
          capCircle.ry,
        )
      }
      
    }

  drawCurvedLine(context: any, start: number[], end: number[], curve: number[]) {
    context.beginPath();
    context.moveTo(start[0], start[1]);
    context.quadraticCurveTo(curve[0], curve[1], end[0], end[1]);
    context.stroke();
  }

  drawCurvedLineWithinPath(context: any, start: number[], end: number[], curve: number[]) {
    context.lineTo(start[0], start[1]);
    context.quadraticCurveTo(curve[0], curve[1], end[0], end[1]);
  }

  /**
   * 
   * @param context canvas context
   * @param start start circle center
   * @param end end circle center
   * @param curveCenterY how high to make the curve point
   */
  drawGill(
    context: any,
    start: {cx: number, cy: number, rx: number, ry: number}, 
    end: {cx: number, cy: number, rx: number, ry: number},
    curveCenterY: number,
    fillStart: string,
    fillStop: string
  ) {
    const degrees: number[] = [0, 45, 135, 180, 225, 250, 270, 290, 315];
    for (let i=0; i < 10; i++) {
    }
    for (const degree of degrees) {
      context.save();
      const angle = degree * (Math.PI/180);
      const point = this.findEllipsePoint(start.rx, start.ry, angle);
      const endPoint = this.findEllipsePoint(end.rx, end.ry, angle);
      const grad = context.createLinearGradient(start.cy, start.cy, start.cy, end.cy);
      grad.addColorStop(0.1, fillStart);
      grad.addColorStop(0.95, fillStop);
      context.strokeStyle = grad;
      context.lineWidth = 0.9;
      this.drawCurvedLine(context,
        [start.cx + point[0], start.cy + point[1]],
        [end.cx + endPoint[0], end.cy + endPoint[1]],
        [start.cx + point[0] * 2, curveCenterY],
      )
      context.restore(); 
    }
  }

  /**
   * 
   * @param context canvas context
   * @param start start circle center
   * @param end end circle center
   * @param curveCenterY how high to make the curve point
   */
  drawGillBackground(
    context: any,
    start: {cx: number, cy: number, rx: number, ry: number}, 
    end: {cx: number, cy: number, rx: number, ry: number},
    curveCenterY: number,
    fillStart: string,
    fillStop: string,
  ) {

    const grad = context.createLinearGradient(start.cy, start.cy, start.cy, end.cy);
    grad.addColorStop(0, fillStart);
    grad.addColorStop(0.95, fillStop);

      context.save();
      context.beginPath();
      // left angle
      let angle = 0 * (Math.PI/180);
      let point = this.findEllipsePoint(start.rx, start.ry, angle);
      let endPoint = this.findEllipsePoint(end.rx, end.ry, angle);
      this.drawCurvedLineWithinPath(context,
        [start.cx + point[0], start.cy + point[1]],
        [end.cx + endPoint[0], end.cy + endPoint[1]],
        [start.cx + point[0] * 2, curveCenterY],
      )
      console.log('DRAW GILLED PATH')

      // right angle
      let angle2 = 180 * (Math.PI/180);
      let point2 = this.findEllipsePoint(start.rx, start.ry, angle2);
      let endPoint2 = this.findEllipsePoint(end.rx, end.ry, angle2);

      // start 
      this.drawCurvedLineWithinPath(context,
        [end.cx + endPoint[0], end.cy + endPoint[1]],
        [end.cx + endPoint2[0], end.cy + endPoint2[1]],
        [end.cx, end.cy],
      )

      // right angle
      this.drawCurvedLineWithinPath(context,
        [end.cx + endPoint2[0], end.cy + endPoint2[1]],
        [start.cx + point2[0], start.cy + point2[1]],
        [start.cx + point2[0] * 2, curveCenterY],
      )

      // end 
      this.drawCurvedLineWithinPath(context,
        [start.cx + point2[0], start.cy + point2[1]],
        [start.cx + point[0], start.cy + point[1]],
        [start.cx, start.cy],
      )
      context.fillStyle = grad;
      context.fill();
      context.restore();
    
    // }
  }

  findEllipsePoint(horizontalRadius: number, verticalRadius: number, angle: number) {
    const x = horizontalRadius * Math.cos(angle);
    const y = verticalRadius * Math.sin(angle);
    return [x, y];
  }

  // draws a 4 point curve
  mushroomPath(start: number[], firstPoint: number[], secondPoint: number[], end: number[], numOfPoints = 10) {
    const x1 = start[0];
    const y1 = start[1];
    const x2 = firstPoint[0];
    const y2 = firstPoint[1];
    const x3 = secondPoint[0];
    const y3 = secondPoint[1];
    const x4 = end[0];
    const y4 = end[1];
    const points = [];
    for (let t = 0; t<1; t+= (1/numOfPoints)) {
      const x = ((1 - t)**3 * x1) + (3 * (1 - t)**2 * t * x2) + (3 * (1 - t) * t**2 * x3) + (t**3 * x4);
      const y = ((1 - t)**3 * y1) + (3 * (1 - t)**2 * t * y2) + (3 * (1 - t) * t**2 * y3) + (t**3 * y4);
  
      this.ellipse(this.context, x, y, 1, 1, false);
      points.push([x, y]);
    }
    return points;
  }
}
