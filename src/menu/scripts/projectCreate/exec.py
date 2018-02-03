#python 2.7
#Script to create a project based on a given template
import os
import shutil
import sys

def copyDirectory(src, dest):
    try:
        shutil.copytree(src, dest)
    # Directories are the same
    except shutil.Error as e:
        print('Directory not copied. Error: %s' % e)
    # Any error saying that the directory doesn't exist
    except OSError as e:
        print('Directory not copied. Error: %s' % e)


def main(script,myDir,name) :

    scriptDir = os.path.dirname(__file__)
    src = os.path.join(scriptDir,"template")
    if name is not 'None':
        dest = os.path.join(myDir,name)
    else :
        dest = os.path.join(myDir,"Untitled")

    copyDirectory(src, dest)




if __name__ == '__main__':
            #print sys.argv
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
