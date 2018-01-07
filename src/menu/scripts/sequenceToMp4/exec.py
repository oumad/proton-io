def convertSelected(ffmpegExec,inputPattern,outputPattern,frameRate,scale,crf,trc,startFrame,totalFrames,myAudio) :
    print "converting Selected only..."
    args = []
    if ffmpegExec != 'None':
        args.extend([ffmpegExec])
    else:
        scriptDir = os.path.dirname(__file__)
        ffmpegExec = os.path.join(scriptDir,'..','..','libs','ffmpeg.exe')
        ffmpegExec = os.path.realpath(ffmpegExec)
        args.extend([ffmpegExec])
    """
    #check if arguments exist to add

        """
    if frameRate != 'None':
        args.extend(['-r',frameRate])
    if trc != 'None':
        args.extend(['-apply_trc',trc])

    if inputPattern != 'None':
        args.extend(['-i',inputPattern])

    if myAudio != 'None':
        args.extend(['-i',myAudio])

    if crf != 'None':
        args.extend(['-crf',crf])
    if scale != 'None':
        args.extend(['-vf','scale=iw*{}:ih*{}'.format(scale,scale)])
    if startFrame != 'None':
        args.extend(['-start_number',startFrame])

    if totalFrames != 'None':
        print totalFrames
        args.extend(['-vframes {}'.format(11)])

    args.extend(['-vcodec','libx264','-pix_fmt','yuv420p',outputPattern])

    print args
    #execute the args
    subprocess.Popen(args)

def convertSequence(ffmpegExec,inputPattern,outputPattern,frameRate,scale,crf,trc,myAudio) :
    args = []
    if ffmpegExec != 'None':
        args.extend([ffmpegExec])
    else:
        scriptDir = os.path.dirname(__file__)
        ffmpegExec = os.path.join(scriptDir,'..','..','libs','ffmpeg.exe')
        ffmpegExec = os.path.realpath(ffmpegExec)
        args.extend([ffmpegExec])
    #check if arguments exist to add
    if frameRate != 'None':
        args.extend(['-r',frameRate])
    if trc != 'None':
        args.extend(['-apply_trc',trc])
    if inputPattern != 'None':
        args.extend(['-i',inputPattern])
    if myAudio != 'None':
        args.extend(['-i',myAudio,"-filter_complex",'[1:0] apad',"-shortest"])
    if crf != 'None':
        args.extend(['-crf',crf])
    if scale != 'None':
        args.extend(['-vf','scale=iw*{}:ih*{}'.format(scale,scale)])

    args.extend(['-vcodec','libx264','-pix_fmt','yuv420p',outputPattern])

    #execute the args
    subprocess.Popen(args)

def main(script,myDir,mySel,ffmpegExec,frameRate,scale,trc,crf,myAudio,outDir) :

    #make list of selected files
    mySel = open(mySel,"r")
    mySel = mySel.read()
    imageList = mySel.split(',')

    #match pattern
    p = re.compile('(.*)(\.|\_)(\d{3,6})\..+')
    #get matched frame number
    frameNum = p.search(imageList[0]).group(3)
    #getting start and total frames
    startFrame = str(int(frameNum))
    totalFrames = len(imageList)
    #replacement for the frame number
    replacement = '%0{}d'.format(len(frameNum))
    #frame path input pattern
    inputPattern = imageList[0].replace(frameNum,replacement)

    #switch extention to mp4 for out put pattern
    if outDir == 'None':
        outputPattern = p.search(imageList[0]).group(1) + '.mp4'
        print outputPattern
    else :
        outputPattern = outDir + '\\' + os.path.basename(p.search(imageList[0]).group(1) + '.mp4')
        print outputPattern
    convertSequence(ffmpegExec,inputPattern,outputPattern,frameRate,scale,crf,trc,myAudio)

    """
    if (len(imageList) > 1):
        convertSelected(ffmpegExec,inputPattern,outputPattern,frameRate,scale,crf,trc,startFrame,totalFrames,myAudio)
    else :
        convertSequence(ffmpegExec,inputPattern,outputPattern,frameRate,scale,crf,trc,myAudio)
    """

    #return (myDir,mySel,arg1,arg2,arg3)


if __name__ == '__main__':
            import os
            import sys
            import re
            import subprocess
            #dir_path = os.path.dirname(os.path.realpath(__file__))
            #sys.path.append("{}/dependencies/python".format(dir_path))
            try:
                main(*sys.argv)
                #raw_input("Press ENTER to exit")
            except:
                print sys.exc_info()[0]
                import traceback
                print traceback.format_exc()
                print "Press Enter to continue ..."
                raw_input("Press ENTER to exit")
