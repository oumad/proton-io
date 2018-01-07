

def main(script,myDir,mySel,renderExec,renderer,proj,cam,fStart,fEnd,byFrame,xRes,yRes,resPerc,fFormat,outName,outDir) :
    import subprocess
    #print script,myDir,mySel,aerenderExec,compName,startf,endf,outName,outDir
    print myDir,mySel,renderExec,renderer,proj,cam,fStart,fEnd,byFrame,xRes,yRes,resPerc,fFormat,outName,outDir

    #start creating the arguments list
    args = []
    #resolving the magick executable
    if renderExec != 'None':
        args.extend([renderExec])
    else:
        args.extend(['render'])

    #check if arguments exist to add
    if renderer != 'None':
        args.extend(['-renderer',renderer])
    if proj != 'None':
        args.extend(['-proj',proj])
    if cam != 'None':
        args.extend(['-cam',cam])
    if fStart != 'None':
        args.extend(['-s',fStart])
    if fEnd != 'None':
        args.extend(['-e',fEnd])
    if byFrame != 'None':
        args.extend(['-b',byFrame])
    if xRes != 'None':
        args.extend(['-x',xRes])
    if yRes != 'None':
        args.extend(['-y',yRes])
    if resPerc != 'None':
        args.extend(['-percentRes',resPerc])
    if fFormat != 'None':
        args.extend(['-of',fFormat])
    if outName != 'None':
        args.extend(['-im',outName])
    if (outDir != 'None'):
        args.extend(['-rd',outDir])

    #append the file path
    args.extend([mySel])
    print args
    #execute the args

    subprocess.Popen(args)



if __name__ == '__main__':
            import os
            import sys
            import re

            try:
                main(*sys.argv)
                raw_input("Press ENTER to exit")
            except:
                print sys.exc_info()[0]
                import traceback
                print traceback.format_exc()
                print "Press Enter to continue ..."
                raw_input("Press ENTER to exit")
