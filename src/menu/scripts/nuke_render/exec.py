import subprocess
import os
import sys

def main(script,mySel,nukeExe,writeNode,frames) :
    mySel = open(mySel,"r")
    mySel = mySel.read()
    mySel = mySel.split(',')

    for nukeFile in mySel:
        args = [nukeExe]
        #check if arguments exist to add
        if frames is not 'None':
            args.extend(['-F',frames])
        if writeNode is not 'None':
            args.extend(['-X',writeNode])
        args.extend([nukeFile])
        #execute the args
        subprocess.Popen(args)


if __name__ == '__main__':
            main(*sys.argv)

            """
            try:
                main(*sys.argv)
                #raw_input("Press ENTER to exit")
            except:
                print sys.exc_info()[0]
                import traceback
                print traceback.format_exc()
                print "Press Enter to continue ..."
                raw_input("Press ENTER to exit")
            """