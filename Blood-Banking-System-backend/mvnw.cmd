@echo off
setlocal
set M2_HOME=
set MAVEN_PROJECTBASEDIR=%~dp0
set MVNW_DIR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper
set MAVEN_WRAPPER_JAR=%MVNW_DIR%\maven-wrapper.jar
set MAVEN_WRAPPER_PROPERTIES=%MVNW_DIR%\maven-wrapper.properties

if not defined JAVA_HOME goto noJavaHome
set JAVA_EXE=%JAVA_HOME%\bin\java.exe
goto run

:noJavaHome
set JAVA_EXE=java.exe

:run
"%JAVA_EXE%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR:~0,-1%" -cp "%MAVEN_WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
endlocal
