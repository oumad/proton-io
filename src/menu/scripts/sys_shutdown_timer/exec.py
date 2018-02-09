import subprocess
import sys

def main(script,timer,cancel) :

    if cancel == "true":
        args = ["shutdown","-a"]
    else:
        args = ["shutdown","-s","-t",timer]
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