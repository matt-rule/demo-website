import { mat3, vec2 } from "gl-matrix";

export class TexObject {
    public bitmap: HTMLImageElement;
    public texture: WebGLTexture | null = null;

    public constructor( bitmap: HTMLImageElement )
    {
        this.bitmap = bitmap;   // TODO consider passing by reference, make sure this is not a clone operation
    }

    public glInit( gl: WebGL2RenderingContext ): void {
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.bitmap);
        gl.generateMipmap(gl.TEXTURE_2D);
    }

    public glRenderFromCorner( gl: WebGL2RenderingContext, shaderProgramTextured: WebGLProgram,
        currentMatrix: mat3, matLocationTextured: WebGLUniformLocation,
        uvOffsetLocation: WebGLUniformLocation, uvScaleLocation: WebGLUniformLocation, samplerLocation: WebGLUniformLocation,
        squareIndices: number[], position: vec2, scale: number, flip: boolean = false )
    {
        let modelMatrix = mat3.create();
        mat3.translate( modelMatrix, modelMatrix, position );           // world space translation

        mat3.scale ( modelMatrix, modelMatrix, vec2.fromValues( scale, scale ) );           // applying this appears to be causing a translation
        if (flip)
        {
            mat3.translate( modelMatrix, modelMatrix, vec2.fromValues( 1.0, 0.0 ) );
            mat3.scale( modelMatrix, modelMatrix, vec2.fromValues( -1.0, 1.0 ) );           // this also appears to be causing a translation
        }

        let mvp = mat3.create();
        mat3.multiply( mvp, currentMatrix, modelMatrix )
        gl.uniformMatrix3fv( matLocationTextured, false, mvp );

        let uvScale = vec2.fromValues(1, 1);
        let uvOffset = vec2.fromValues(0, 0);
        gl.uniform2fv(uvOffsetLocation, uvOffset);
        gl.uniform2fv(uvScaleLocation, uvScale);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(samplerLocation, 0);

        gl.drawElements(gl.TRIANGLES, squareIndices.length, gl.UNSIGNED_SHORT, 0);
    }

    public glRenderFromMiddle( gl: WebGL2RenderingContext, shaderProgramTextured: WebGLProgram,
        currentMatrix: mat3, matLocationTextured: WebGLUniformLocation,
        uvOffsetLocation: WebGLUniformLocation, uvScaleLocation: WebGLUniformLocation, samplerLocation: WebGLUniformLocation,
        squareIndices: number[], position: vec2, scale: number, rotateAngleRad: number )
    {
        let modelMatrix = mat3.create();
        mat3.translate( modelMatrix, modelMatrix, position );
        mat3.rotate( modelMatrix, modelMatrix, rotateAngleRad );

        mat3.scale ( modelMatrix, modelMatrix, vec2.fromValues( scale, scale ) );

        let mvp = mat3.create();
        mat3.multiply( mvp, currentMatrix, modelMatrix )
        gl.uniformMatrix3fv( matLocationTextured, false, mvp );

        let uvScale = vec2.fromValues(1, 1);
        let uvOffset = vec2.fromValues(0, 0);
        gl.uniform2fv(uvOffsetLocation, uvOffset);
        gl.uniform2fv(uvScaleLocation, uvScale);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(samplerLocation, 0);

        gl.drawElements(gl.TRIANGLES, squareIndices.length, gl.UNSIGNED_SHORT, 0);
    }
};
