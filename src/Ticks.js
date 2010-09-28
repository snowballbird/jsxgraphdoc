/*
    Copyright 2008,2009
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Bianca Valentin,
        Alfred Wassermann,
        Peter Wilfahrt

    This file is part of JSXGraph.

    JSXGraph is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    JSXGraph is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with JSXGraph.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * @fileoverview In this file the geometry object Ticks is defined. Ticks provides
 * methods for creation and management of ticks on an axis.
 * @author graphjs
 * @version 0.1
 */

/**
 * Creates ticks for an axis.
 * @class Ticks provides methods for creation and management
 * of ticks on an axis.
 * @param {JXG.Line} line Reference to the axis the ticks are drawn on.
 * @param {Number,Array,Function} ticks Number, array or function defining the ticks.
 * @param {int} major Every major-th tick is drawn with heightmajorHeight, the other ones are drawn with height minorHeight.
 * @param {int} majorHeight The height used to draw major ticks.
 * @param {int} minorHeight The height used to draw minor ticks.
 * @param {String} id Unique identifier for this object.  If null or an empty string is given,
 * an unique id will be generated by Board.
 * @param {String} name Not necessarily unique name, won't be visible or used by this object.
 * @see JXG.Board#addTicks
 * @constructor
 * @extends JXG.GeometryElement
 */
JXG.Ticks = function (line, ticks, minor, majorHeight, minorHeight, id, name, layer) {
    /* Call the constructor of GeometryElement */
    this.constructor();

    /**
     * Type of GeometryElement, value is OBJECT_TYPE_ARC.
     * @final
     * @type int
     */
    this.type = JXG.OBJECT_TYPE_TICKS;

    /**
     * Class of the element, value is OBJECT_CLASS_CIRCLE.
     * @final
     * @type int
     */
    this.elementClass = JXG.OBJECT_CLASS_OTHER;

    /**
     * Set the display layer.
     */
    //if (layer == null) layer = board.options.layer['line']; // no board available
    //this.layer = layer;

    /**
     * The line the ticks belong to.
     * @type JXG.Line
     */
    this.line = line;

    /**
     * The board the ticks line is drawn on.
     * @type JXG.Board
     */
    this.board = this.line.board;

    /**
     * A function calculating ticks delta depending on the ticks number.
     * @type Function
     */
    this.ticksFunction = null;

    /**
     * Array of fixed ticks.
     * @type Array
     */
    this.fixedTicks = null;

    /**
     * Equidistant ticks. Distance is defined by ticksFunction
     * @type bool
     */
    this.equidistant = false;

    if(JXG.isFunction(ticks)) {
        this.ticksFunction = ticks;
        throw new Error("Function arguments are no longer supported.");
    } else if(JXG.isArray(ticks))
        this.fixedTicks = ticks;
    else {
        if(Math.abs(ticks) < JXG.Math.eps)
            ticks = this.board.options.line.ticks.defaultDistance;
        this.ticksFunction = function (i) { return ticks; };
        this.equidistant = true;
    }

    /**
     * minorTicks is the number of minor ticks between two major ticks.
     * @type int
     */
    this.minorTicks = ( (minor == null)? this.board.options.line.ticks.minorTicks : minor);
    if(this.minorTicks < 0)
        this.minorTicks = -this.minorTicks;

    /**
     * Total height of a major tick.
     * @type int
     */
    this.majorHeight = ( (majorHeight == null) || (majorHeight == 0) ? this.board.options.line.ticks.majorHeight : majorHeight);
    if(this.majorHeight < 0)
        this.majorHeight = -this.majorHeight;

    /**
     * Total height of a minor tick.
     * @type int
     */
    this.minorHeight = ( (minorHeight == null) || (minorHeight == 0) ? this.board.options.line.ticks.minorHeight : minorHeight);
    if(this.minorHeight < 0)
        this.minorHeight = -this.minorHeight;

    /**
     * Least distance between two ticks, measured in pixels.
     * @type int
     */
    this.minTicksDistance = this.board.options.line.ticks.minTicksDistance;

    /**
     * Maximum distance between two ticks, measured in pixels. Is used only when insertTicks
     * is set to true.
     * @type int
     * @see #insertTicks
     */
    this.maxTicksDistance = this.board.options.line.ticks.maxTicksDistance;

    /**
     * If the distance between two ticks is too big we could insert new ticks. If insertTicks
     * is <tt>true</tt>, we'll do so, otherwise we leave the distance as is.
     * This option is ignored if equidistant is false.
     * @type bool
     * @see #equidistant
     * @see #maxTicksDistance
     */
    this.insertTicks = this.board.options.line.ticks.insertTicks;

    /**
     * Draw the zero tick, that lies at line.point1?
     * @type bool
     */
    this.drawZero = this.board.options.line.ticks.drawZero;

    /**
     * Draw labels yes/no
     * @type bool
     */
    this.drawLabels = this.board.options.line.ticks.drawLabels;

    /**
     * Array where the labels are saved. There is an array element for every tick,
     * even for minor ticks which don't have labels. In this case the array element
     * contains just <tt>null</tt>.
     * @type array
     */
    this.labels = [];

    /* Call init defined in GeometryElement to set board, id and name property */
    this.init(this.board, id, name);

    this.visProp['visible'] = true;

    this.visProp['fillColor'] = this.line.visProp['fillColor'];
    this.visProp['highlightFillColor'] = this.line.visProp['highlightFillColor'];
    this.visProp['strokeColor'] = this.line.visProp['strokeColor'];
    this.visProp['highlightStrokeColor'] = this.line.visProp['highlightStrokeColor'];
    this.visProp['strokeWidth'] = this.line.visProp['strokeWidth'];

    /* Register ticks at line*/
    this.id = this.line.addTicks(this);
    /* Register ticks at board*/
    this.board.setId(this,'Ti');
};

JXG.Ticks.prototype = new JXG.GeometryElement;

/**
 * Always returns false.
 * @param {int} x Coordinate in x direction, screen coordinates.
 * @param {int} y Coordinate in y direction, screen coordinates.
 * @return {bool} Always returns false.
 */
JXG.Ticks.prototype.hasPoint = function (x, y) {
   return false;
};

/**
 * (Re-)calculates the ticks coordinates.
 */
JXG.Ticks.prototype.calculateTicksCoordinates = function() {
    
    /*
     * 
     * It's all new in here but works pretty well.
     * Known bugs:
     *   * Special ticks behave oddly. See example ticked_lines.html and drag P2 around P1.
     * 
     */
        // Point 1 of the line
    var p1 = this.line.point1,
        // Point 2 of the line
        p2 = this.line.point2,
        // Distance between the two points from above
        distP1P2 = p1.coords.distance(JXG.COORDS_BY_USER, p2.coords),
        // Distance of X coordinates of two major ticks
        // Initialized with the distance of Point 1 to a point between Point 1 and Point 2 on the line and with distance 1
        deltaX = (p2.coords.usrCoords[1] - p1.coords.usrCoords[1])/distP1P2,
        // The same thing for Y coordinates
        deltaY = (p2.coords.usrCoords[2] - p1.coords.usrCoords[2])/distP1P2,
        // Distance of p1 to the unit point in screen coordinates
        distScr = p1.coords.distance(JXG.COORDS_BY_SCREEN, new JXG.Coords(JXG.COORDS_BY_USER, [p1.coords.usrCoords[1] + deltaX, p1.coords.usrCoords[2] + deltaY], this.board)),
        // Distance between two major ticks in user coordinates
        ticksDelta = (this.equidistant ? this.ticksFunction(1) : 1),
        // This factor is for enlarging ticksDelta and it switches between 5 and 2
        // Hence, if two major ticks are too close together they'll be expanded to a distance of 5
        // if they're still too close together, they'll be expanded to a distance of 10 etc
        factor = 5,
        // Edge points: This is where the display of the line starts and ends, e.g. the intersection points
        // of the line with the edges of the viewing area if the line is a straight.
        e1, e2,
        // Which direction do we go? Plus or Minus
        dir = 1,
        // what's the first/last tick to draw?
        begin, end,
        // Coordinates of the current tick
        tickCoords,
        // Coordinates of the first drawn tick
        startTick,
        // a counter
        i,
        // the distance of the tick to p1. Is displayed on the board using a label
        // for majorTicks
        tickPosition,
        // creates a label
        makeLabel = function(pos, newTick, board, drawLabels, id) {
            var labelText, label;
            
            labelText = pos.toString();
            if(labelText.length > 5)
                labelText = pos.toPrecision(3).toString();
            label = new JXG.Text(board, labelText, null, [newTick.usrCoords[1], newTick.usrCoords[2]], id+i+"Label", '', null, true, board.options.text.defaultDisplay);
            label.distanceX = 0;
            label.distanceY = -10;
            label.setCoords(newTick.usrCoords[1]*1+label.distanceX/(board.stretchX), 
                            newTick.usrCoords[2]*1+label.distanceY/(board.stretchY));
            
            if (drawLabels) {
                label.visProp['visible'] = true; 
            } else {
                label.visProp['visible'] = false;
            }
            return label;
        },
        
        respDelta = function(val) {
            return Math.floor(val) - (Math.floor(val) % ticksDelta);
        },
        
        // the following variables are used to define ticks height and slope
        eps = JXG.Math.eps,
        slope = -this.line.getSlope(),
        distMaj = this.majorHeight/2,
        distMin = this.minorHeight/2,
        dxMaj = 0, dyMaj = 0,
        dxMin = 0, dyMin = 0;
        
    // END OF variable declaration
        

    // this piece of code used to be in AbstractRenderer.updateAxisTicksInnerLoop
    // and has been moved in here to clean up the renderers code.
    //
    // The code above only calculates the position of the ticks. The following code parts
    // calculate the dx and dy values which make ticks out of this positions, i.e. from the
    // position (p_x, p_y) calculated above we have to draw a line from
    // (p_x - dx, py - dy) to (p_x + dx, p_y + dy) to get a tick.

    if(Math.abs(slope) < eps) {
        // if the slope of the line is (almost) 0, we can set dx and dy directly
        dxMaj = 0;
        dyMaj = distMaj;
        dxMin = 0;
        dyMin = distMin;
    } else if((Math.abs(slope) > 1/eps) || (isNaN(slope))) {
        // if the slope of the line is (theoretically) infinite, we can set dx and dy directly
        dxMaj = distMaj;
        dyMaj = 0;
        dxMin = distMin;
        dyMin = 0;
    } else {
        // here we have to calculate dx and dy depending on the slope and the length of the tick (dist)
        // if slope is the line's slope, the tick's slope is given by
        //
        //            1          dy
        //     -   -------  =   ----                 (I)
        //          slope        dx
        //
        // when dist is the length of the tick, using the pythagorean theorem we get
        //
        //     dx*dx + dy*dy = dist*dist             (II)
        //
        // dissolving (I) by dy and applying that to equation (II) we get the following formulas for dx and dy
        dxMaj = -distMaj/Math.sqrt(1/(slope*slope) + 1);
        dyMaj = dxMaj/slope;
        dxMin = -distMin/Math.sqrt(1/(slope*slope) + 1);
        dyMin = dxMin/slope;
    }

    // BEGIN: clean up the mess we left from our last run through this function
    // remove existing ticks
    if(this.ticks != null) {
        //if (this.board.needsFullUpdate     // Do not remove labels because of efficiency
        //    || this.needsRegularUpdate
        //    ) {
            for(var j=0; j<this.ticks.length; j++) {
                if(this.labels[j] != null && this.labels[j].visProp['visible']) { 
                    this.board.renderer.remove(this.labels[j].rendNode); 
                }
            }
            //console.log("Update label ticks");
        //}
    }

    // initialize storage arrays
    // ticks stores the ticks coordinates
    this.ticks = new Array();
    
    // labels stores the text to display beside the ticks
    this.labels = new Array();
    // END cleanup
    
    // calculate start (e1) and end (e2) points
    // for that first copy existing lines point coordinates...
    e1 = new JXG.Coords(JXG.COORDS_BY_USER, [p1.coords.usrCoords[1], p1.coords.usrCoords[2]], this.board);
    e2 = new JXG.Coords(JXG.COORDS_BY_USER, [p2.coords.usrCoords[1], p2.coords.usrCoords[2]], this.board);
        
    // ... and calculate the drawn start and end point
    this.board.renderer.calcStraight(this.line, e1, e2);
        
    if(!this.equidistant) {
        // we have an array of fixed ticks we have to draw
        var dx_minus = p1.coords.usrCoords[1]-e1.usrCoords[1];
        var dy_minus = p1.coords.usrCoords[2]-e1.usrCoords[2];
        var length_minus = Math.sqrt(dx_minus*dx_minus + dy_minus*dy_minus);

        var dx_plus = p1.coords.usrCoords[1]-e2.usrCoords[1];
        var dy_plus = p1.coords.usrCoords[2]-e2.usrCoords[2];
        var length_plus = Math.sqrt(dx_plus*dx_plus + dy_plus*dy_plus);

        // new ticks coordinates
        var nx = 0;
        var ny = 0;

        for(var i=0; i<this.fixedTicks.length; i++) {
            // is this tick visible?
            if((-length_minus <= this.fixedTicks[i]) && (this.fixedTicks[i] <= length_plus)) {
                if(this.fixedTicks[i] < 0) {
                    nx = Math.abs(dx_minus) * this.fixedTicks[i]/length_minus;
                    ny = Math.abs(dy_minus) * this.fixedTicks[i]/length_minus;
                } else {
                    nx = Math.abs(dx_plus) * this.fixedTicks[i]/length_plus;
                    ny = Math.abs(dy_plus) * this.fixedTicks[i]/length_plus;
                }

                tickCoords = new JXG.Coords(JXG.COORDS_BY_USER, [p1.coords.usrCoords[1] + nx, p1.coords.usrCoords[2] + ny], this.board);
                this.ticks.push(tickCoords);
                this.ticks[this.ticks.length-1].major = true;
                
                this.labels.push(makeLabel(this.fixedTicks[i], tickCoords, this.board, this.drawLabels, this.id));
            }
        }
        this.dxMaj = dxMaj;
        this.dyMaj = dyMaj;
        this.dxMin = dxMin;
        this.dyMin = dyMin;
        //this.board.renderer.updateTicks(this, dxMaj, dyMaj, dxMin, dyMin);
        return;
    } // ok, we have equidistant ticks and not special ticks, so we continue here with generating them:
    
    // adjust distances
    while(distScr > 4*this.minTicksDistance) {
        ticksDelta /= 10;
        deltaX /= 10;
        deltaY /= 10;

        distScr = p1.coords.distance(JXG.COORDS_BY_SCREEN, new JXG.Coords(JXG.COORDS_BY_USER, [p1.coords.usrCoords[1] + deltaX, p1.coords.usrCoords[2] + deltaY], this.board));
    }

    // If necessary, enlarge ticksDelta
    while(distScr < this.minTicksDistance) {
        ticksDelta *= factor;
        deltaX *= factor;
        deltaY *= factor;

        factor = (factor == 5 ? 2 : 5);
        distScr = p1.coords.distance(JXG.COORDS_BY_SCREEN, new JXG.Coords(JXG.COORDS_BY_USER, [p1.coords.usrCoords[1] + deltaX, p1.coords.usrCoords[2] + deltaY], this.board));
    }

    /*
     * In the following code comments are sometimes talking about "respect ticksDelta". this could be done
     * by calculating the modulus of the distance wrt to ticksDelta and add resp. subtract a ticksDelta from that.
     */

    // p1 is outside the visible area or the line is a segment
    if(this.board.renderer.isSameDirection(p1.coords, e1, e2)) {
        // calculate start and end points
        begin = respDelta(p1.coords.distance(JXG.COORDS_BY_USER, e1));
        end = p1.coords.distance(JXG.COORDS_BY_USER, e2);
        
        if(this.board.renderer.isSameDirection(p1.coords, p2.coords, e1)) {
            if(this.line.visProp.straightFirst)
                begin -=  2*ticksDelta;
        } else {
            end = -1*end;
            begin = -1*begin;
            if(this.line.visProp.straightFirst)
                begin -= 2*ticksDelta
        }
        
        // TODO: We should check here if the line is visible at all. If it's not visible but
        // close to the viewport there may be drawn some ticks without a line visible.
        
    } else {
        // p1 is inside the visible area and direction is PLUS

        // now we have to calculate the index of the first tick
        if(!this.line.visProp.straightFirst) {
            begin = 0; 
        } else {
            begin = -respDelta(p1.coords.distance(JXG.COORDS_BY_USER, e1)) - 2*ticksDelta;
        }
        
        if(!this.line.visProp.straightLast) {
            end = distP1P2;
        } else {
            end = p1.coords.distance(JXG.COORDS_BY_USER, e2);
        }
    }

    startTick = new JXG.Coords(JXG.COORDS_BY_USER, [p1.coords.usrCoords[1] + begin*deltaX/ticksDelta, p1.coords.usrCoords[2] + begin*deltaY/ticksDelta], this.board);
    tickCoords = new JXG.Coords(JXG.COORDS_BY_USER, [p1.coords.usrCoords[1] + begin*deltaX/ticksDelta, p1.coords.usrCoords[2] + begin*deltaY/ticksDelta], this.board);
    
    deltaX /= this.minorTicks+1;
    deltaY /= this.minorTicks+1;
    
//    JXG.debug('begin: ' + begin + '; e1: ' + e1.usrCoords[1] + ', ' + e1.usrCoords[2]);
//    JXG.debug('end: ' + end + '; e2: ' + e2.usrCoords[1] + ', ' + e2.usrCoords[2]);
    
    
    // After all the precalculations from above here finally comes the tick-production:
    i = 0;
    tickPosition = begin;
    while(startTick.distance(JXG.COORDS_BY_USER, tickCoords) < Math.abs(end - begin) + JXG.Math.eps) {
        if(i % (this.minorTicks+1) == 0) {
            tickCoords.major = true;
            this.labels.push(makeLabel(tickPosition, tickCoords, this.board, this.drawLabels, this.id));
            tickPosition += ticksDelta;
        } else {
            tickCoords.major = false;
            this.labels.push(null);
        }
        i++;

        this.ticks.push(tickCoords);
        tickCoords = new JXG.Coords(JXG.COORDS_BY_USER, [tickCoords.usrCoords[1] + deltaX, tickCoords.usrCoords[2] + deltaY], this.board);
        if(!this.drawZero && tickCoords.distance(JXG.COORDS_BY_USER, p1.coords) <= JXG.Math.eps) {
            // zero point is always a major tick. hence, we have to set i = 0;
            i++;
            tickPosition += ticksDelta;
            tickCoords = new JXG.Coords(JXG.COORDS_BY_USER, [tickCoords.usrCoords[1] + deltaX, tickCoords.usrCoords[2] + deltaY], this.board);
        }
    }

    this.dxMaj = dxMaj;
    this.dyMaj = dyMaj;
    this.dxMin = dxMin;
    this.dyMin = dyMin;
    //this.board.renderer.updateTicks(this, dxMaj, dyMaj, dxMin, dyMin);
    return;
};

/**
 * Uses the boards renderer to update the arc.
 * update() is not needed for arc.
 */
JXG.Ticks.prototype.updateRenderer = function () {
    if (this.needsUpdate) {
        this.calculateTicksCoordinates();
        this.board.renderer.updateTicks(this, this.dxMaj, this.dyMaj, this.dxMin, this.dyMin);
        this.needsUpdate = false;
    }
};

/**
 * Creates new ticks.
 * @param {JXG.Board} board The board the ticks are put on.
 * @param {Array} parents Array containing a line and an array of positions, where ticks should be put on that line or
 *   a function that calculates the distance based on the ticks number that is given as a parameter. E.g.:<br />
 *   <tt>var ticksFunc = function(i) {</tt><br />
 *   <tt>    return 2;</tt><br />
 *   <tt>}</tt><br />
 *   for ticks with distance 2 between each tick.
 * @param {Object} attributs Object containing properties for the element such as stroke-color and visibility. See @see JXG.GeometryElement#setProperty
 * @type JXG.Ticks
 * @return Reference to the created ticks object.
 */
JXG.createTicks = function(board, parents, attributes) {
    var el;
    attributes = JXG.checkAttributes(attributes,{layer:null});
    if ( (parents[0].elementClass == JXG.OBJECT_CLASS_LINE) && (JXG.isFunction(parents[1]) || JXG.isArray(parents[1]) || JXG.isNumber(parents[1]))) {
        el = new JXG.Ticks(parents[0], parents[1], attributes['minorTicks'], attributes['majHeight'], attributes['minHeight'], attributes['id'], attributes['name'], attributes['layer']);
    } else
        throw new Error("JSXGraph: Can't create Ticks with parent types '" + (typeof parents[0]) + "' and '" + (typeof parents[1]) + "' and '" + (typeof parents[2]) + "'.");

    return el;
};

JXG.JSXGraph.registerElement('ticks', JXG.createTicks);
