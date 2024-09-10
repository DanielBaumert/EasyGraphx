
export class Math2 {
  /**
   * 1/6 PI <=> 30°
   */
  public static readonly RAD30: number = Math.PI / 6;
  /**
   * 2/6 PI <=> 60°
   */
  public static readonly RAD60: number = 2 * this.RAD30;
  /**
   * 3/6 PI <=> 90°
   */
  public static readonly RAD90: number = 3 * this.RAD30;
  /**
   * 4/6 PI <=> 120°
   */
  public static readonly RAD120: number = 4 * this.RAD30;
  /**
   * 5/6 PI <=> 150°
   */
  public static readonly RAD150: number = 5 * this.RAD30;
  /**
   * 6/6 PI <=> 180°
   */
  public static readonly RAD180: number = Math.PI;
  /**
   * 7/6 PI <=> 210°
   */
  public static readonly RAD210: number = 7 * this.RAD30;
  /**
   * 8/6 PI <=> 240°
   */
  public static readonly RAD240: number = 8 * this.RAD30;
  /**
   * 9/6 PI <=> 270°
   */
  public static readonly RAD270: number = 9 * this.RAD30;
  /**
   * 10/6 PI <=> 300°
   */
  public static readonly RAD300: number = 10 * this.RAD30;
  /**
   * 11/6 PI <=> 330°
   */
  public static readonly RAD330: number = 11 * this.RAD30;
  /**
   * 12/6 PI <=> 360°
   */
  public static readonly RAD360: number = 2 * Math.PI;

  /**
   * 1/4 PI <=> 45°
   */
  public static readonly RAD45: number = Math.PI / 4;
  /**
   * 3/4 PI <=> 135°
   */
  public static readonly RAD135: number = 3 * this.RAD45;
  /**
   * 5/4 PI <=> 225°
   */
  public static readonly RAD225: number = 5 * this.RAD45;
  /**
   * 7/4 PI <=> 315°
   */
  public static readonly RAD315: number = 7 * this.RAD45;
  

  public static inRange = (value: number, min: number, max: number): boolean => {
    return min <= value && value <= max;
  }
}