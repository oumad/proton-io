def main(script, myDir, mySel, magickExec, myColor, size, fileFormat, outName, outDir):
    import subprocess

    # start creating the arguments list
    args = []

    # resolving the magick executable
    if magickExec == 'None':
        scriptDir = os.path.dirname(__file__)
        magickPath = os.path.join(scriptDir, '..', '..', 'libs', 'magick.exe')
        magickPath = os.path.realpath(magickPath)
        args.extend([magickPath])
    else:
        args.extend([magickExec])

    # start creating the other arguments
    args.extend(['convert'])

    # Resolving file name
    if outName != 'None':
        outFile = '{name}.{format}'.format(name=outName, format=fileFormat)
    elif myColor.isalpha():
        outFile = '{color}_solid.{format}'.format(color=myColor, format=fileFormat)
    else:
        outFile = 'solid.{}'.format(fileFormat)


    # check if arguments exist to add
    # set solid size
    if size != 'None':
        args.extend(['-size', size])
    # set solid color
    if myColor != 'None':
        args.extend(['xc:{}'.format(myColor)])

    if (outDir != 'None'):
        # create the directory if it doesn't exist
        if not os.path.exists(outDir):
            os.makedirs(outDir)
        outRender = os.path.join(outDir, outFile)
        args.extend([outRender])
    else:
        outRender = os.path.join(myDir, outFile)
        args.extend([outRender])

    print args
    # execute the args
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
