

def main(script,myDir,mySel,magickExec,background,quality,tiles,margin,maxSize,displayName,DisplaySize,textColor,textSize,title,outName,outDir) :
    import subprocess
    #print script,myDir,mySel,aerenderExec,compName,startf,endf,outName,outDir
    print script,myDir,mySel,magickExec,background,quality,outName,outDir
    mySel = open(mySel,"r")
    mySel = mySel.read()
    mySel = mySel.split(',')


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
    args.extend(['montage'])

    for myFile in mySel :
        label = []
        if displayName == "true":
            labelName =  os.path.basename(os.path.splitext(myFile)[0])
            label.append(labelName)
        if DisplaySize == "true":
            label.append("\\n%wx%h")
        if len(label) != 0:
             print ''.join(label)
             args.extend(["-label",''.join(label)])
        args.extend([myFile])

    if textColor != 'None':
        args.extend(["-fill",textColor])

    if textSize != 'None':
        args.extend(["-pointsize",textSize])

    #resolving file name from source
    myDir = os.path.dirname(mySel[0])
    if outName != 'None':
        outFile = os.path.join(myDir,'{}.png'.format(outName))
    else :
        outFile = os.path.join(myDir,'packed.png')

    #constructing the geometry argument
    geometry = []
    if maxSize != 'None':
        geometry.append(maxSize)
    if margin != 'None':
        geometry.append(margin)

    args.extend(['-geometry',''.join(geometry)])

    #check if arguments exist to add
    if tiles != 'None':
        args.extend(['-tile',tiles])
    if background != 'None':
        args.extend(['-background',background])
    if quality != 'None':
        args.extend(['-quality',quality])

    if title != 'None':
        args.extend(['-title',title])
    if (outDir != 'None'):
        #create the directory if it doesn't exist
        if not os.path.exists(outDir):
            os.makedirs(outDir)
        outRender = os.path.join(outDir,outFile)
        args.extend([outRender])
    else:
        args.extend([outFile])

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
