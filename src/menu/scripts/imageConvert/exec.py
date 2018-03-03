import os
import sys
import re
import subprocess

def main(script,myDir,mySel,magickExec,background,scale,size,myFormat,quality,outName,outDir) :

    mySel = open(mySel,"r")
    mySel = mySel.read()
    mySel = mySel.split(',')

    for myFile in mySel :
        #start creating the arguments list
        args = []
        #resolving the magick executable
        if magickExec == 'None':
            scriptDir = os.path.dirname(__file__)
            magickPath = os.path.join(scriptDir,'..','..','libs','magick.exe')
            magickPath = os.path.realpath(magickPath)
            args.extend([magickPath])
        else:
            args.extend([magickExec])

        #start creating the other arguments
        args.extend(['convert',myFile])

        #resolving file name from source
        pre, ext = os.path.splitext(os.path.split(myFile)[1])

        outFile = pre + '.{}'.format(myFormat)

        #check if arguments exist to add
        if background != 'None':
            args.extend(['-background',background,"-flatten"])
        if scale != 'None':
            args.extend(['-scale',scale])
        if size != 'None':
            args.extend(['-resize',size])
        if quality != 'None':
            args.extend(['-quality',quality])
        if (outDir != 'None'):
            #create the directory if it doesn't exist
            if not os.path.exists(outDir):
                os.makedirs(outDir)
            outRender = os.path.join(outDir,outFile)
            args.extend([outRender])
        else:
            outRender = os.path.join(myDir,outFile)
            args.extend([outRender])

        print args
        #execute the args
        subprocess.Popen(args)



if __name__ == '__main__':

            print sys.argv
            main(*sys.argv)
            """
            try:
                print (sys.argv)
                main(*sys.argv)
                #raw_input("Press ENTER to exit")
            except:
                print sys.exc_info()[0]
                import traceback
                print traceback.format_exc()
                print "Press Enter to continue ..."
                raw_input("Press ENTER to exit")
            """
