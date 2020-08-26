// @ts-ignore
export class ChromeRouter {
  public getResourcesPathPrefix(): string {
    const relativePath = "$_{WEBPACK_REPLACE__relativePath}";
    if (relativePath) {
      return `${this.getTargetOrigin()}/${relativePath}`;
    } else {
      return this.getTargetOrigin();
    }
  }

  public getTargetOrigin() {
    return "$_{WEBPACK_REPLACE__targetOrigin}";
  }
}
