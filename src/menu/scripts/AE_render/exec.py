

def main(script,myDir,mySel,aerenderExec,compName,startf,endf,incrementf,RStemplate,OMtemplate,outName,outDir,reuse) :
    import subprocess
    #print script,myDir,mySel,aerenderExec,compName,startf,endf,outName,outDir

    #start creating the arguments
    args = [aerenderExec,'-project',mySel]

    #check if arguments exist to add
    if compName != 'None':
        args.extend(['-comp',compName])
    if startf != 'None':
        args.extend(['-s',startf])
    if endf != 'None':
        args.extend(['-e',endf])
    if incrementf != 'None':
        args.extend(['-i',incrementf])
    if RStemplate != 'None':
        args.extend(['-RStemplate',RStemplate])
    if OMtemplate != 'None':
        args.extend(['-OMtemplate',OMtemplate])
    if (outName != 'None') and (outDir != 'None'):
        outDir = outDir.replace('[projectFolder]',myDir)
        #create the directory if it doesn't exist
        if not os.path.exists(outDir):
            os.makedirs(outDir)
        outRender = os.path.join(outDir,outName)
        args.extend(['-output',outRender])
    if (reuse == 'true'):
        args.extend(['-reuse'])

    #execute the args
    subprocess.Popen(args)


if __name__ == '__main__':
            import os
            import sys
            import re
            
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
